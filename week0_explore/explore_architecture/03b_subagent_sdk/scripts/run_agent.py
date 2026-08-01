#!/usr/bin/env python3
"""
Interactive Agent Runner
Runs agents defined in .claude/agents.js using the Claude Agent SDK.
"""

import sys
import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
import re

try:
    from anthropic import Anthropic
except ImportError:
    print("Error: anthropic library not installed.")
    print("Install with: pip install anthropic")
    sys.exit(1)


class AgentDefinition:
    """Represents an agent configuration."""

    def __init__(self, name: str, description: str, model: str, reasoning_budget: str, instructions: str):
        self.name = name
        self.description = description
        self.model = model
        self.reasoning_budget = reasoning_budget
        self.instructions = instructions

    def __repr__(self):
        return f"<Agent {self.name}: {self.description[:50]}...>"


class AgentRunner:
    """Runs agents with an interactive CLI interface."""

    def __init__(self):
        self.client = Anthropic()
        self.agents = self._load_agents()
        self.conversations: Dict[str, list] = {}  # Store conversation history per agent

    def _load_agents(self) -> Dict[str, AgentDefinition]:
        """Load agent definitions from .claude/agents.js"""
        agents = {}
        agents_file = Path(".claude/agents.js")

        if not agents_file.exists():
            print(f"Warning: {agents_file} not found. Using default agent.")
            agents["mud-client-agent"] = AgentDefinition(
                name="mud-client-agent",
                description="Autonomous MUD player agent",
                model="claude-opus-5",
                reasoning_budget="high",
                instructions="You are an autonomous MUD player agent."
            )
            return agents

        try:
            content = agents_file.read_text()
            # Parse JavaScript module exports
            # Look for pattern: name: {name: "...", description: "...", ...}

            # Extract all agent definitions from the JS file
            agent_pattern = r'(\w+):\s*{\s*name:\s*["\']([^"\']+)["\'],\s*description:\s*["\']([^"\']+)["\'],\s*model:\s*["\']([^"\']+)["\'],\s*reasoning_budget:\s*["\']([^"\']+)["\'],\s*instructions:\s*`([^`]+)`'

            matches = re.finditer(agent_pattern, content, re.DOTALL)

            for match in matches:
                key, name, description, model, reasoning_budget, instructions = match.groups()

                # Unescape the instructions
                instructions = instructions.replace('\\`', '`').replace('\\n', '\n')

                agents[name] = AgentDefinition(
                    name=name,
                    description=description,
                    model=model,
                    reasoning_budget=reasoning_budget,
                    instructions=instructions
                )

            if not agents:
                print("Warning: No agents found in agents.js. Using default.")
                agents["mud-client-agent"] = AgentDefinition(
                    name="mud-client-agent",
                    description="Default MUD client agent",
                    model="claude-opus-5",
                    reasoning_budget="high",
                    instructions="You are an autonomous MUD player agent."
                )

        except Exception as e:
            print(f"Error loading agents: {e}")
            sys.exit(1)

        return agents

    def display_welcome(self):
        """Display welcome message."""
        print("\n" + "="*60)
        print("  CLAUDE AGENT RUNNER - Interactive Mode")
        print("="*60)
        print(f"\nLoaded {len(self.agents)} agent(s):\n")

        for i, (name, agent) in enumerate(self.agents.items(), 1):
            print(f"  {i}. {name}")
            print(f"     {agent.description}")
            print(f"     Model: {agent.model} | Reasoning: {agent.reasoning_budget}")
            print()

    def display_menu(self):
        """Display main menu."""
        print("\nOptions:")
        print("  1. Run an agent")
        print("  2. View agent details")
        print("  3. Clear conversation history")
        print("  4. Exit")
        print("\nOr type an agent name directly to run it.")
        print("-" * 60)

    def get_user_input(self, prompt: str = "> ") -> str:
        """Get input from user."""
        try:
            return input(prompt).strip()
        except EOFError:
            return "exit"
        except KeyboardInterrupt:
            print("\n\nInterrupted. Type 'exit' to quit.")
            return None

    def run_agent(self, agent_name: str, user_input: str):
        """Execute an agent with user input."""
        if agent_name not in self.agents:
            print(f"Error: Agent '{agent_name}' not found.")
            return

        agent = self.agents[agent_name]

        # Initialize conversation history for this agent if needed
        if agent_name not in self.conversations:
            self.conversations[agent_name] = []

        # Add system instructions and user message
        messages = self.conversations[agent_name].copy()

        print(f"\n{'='*60}")
        print(f"Running: {agent.name}")
        print(f"{'='*60}\n")
        print("Agent processing...\n")

        try:
            # Call the Claude API with extended thinking if high reasoning budget
            response = self.client.messages.create(
                model=agent.model,
                max_tokens=16000,
                thinking={
                    "type": "enabled",
                    "budget_tokens": 10000 if agent.reasoning_budget == "high" else 5000
                } if agent.reasoning_budget in ["high", "medium"] else None,
                system=agent.instructions,
                messages=[
                    {
                        "role": "user",
                        "content": user_input
                    }
                ] + messages
            )

            # Extract response text
            response_text = ""
            for block in response.content:
                if hasattr(block, 'text'):
                    response_text = block.text
                    break

            # Display response
            print(response_text)
            print(f"\n{'='*60}\n")

            # Store conversation for context
            self.conversations[agent_name].append({
                "role": "user",
                "content": user_input
            })
            self.conversations[agent_name].append({
                "role": "assistant",
                "content": response_text
            })

            # Keep conversation history manageable (last 10 messages)
            if len(self.conversations[agent_name]) > 20:
                self.conversations[agent_name] = self.conversations[agent_name][-20:]

        except Exception as e:
            print(f"Error running agent: {e}")
            print("Make sure ANTHROPIC_API_KEY is set in your environment.")

    def view_agent_details(self, agent_name: str):
        """Display detailed information about an agent."""
        if agent_name not in self.agents:
            print(f"Error: Agent '{agent_name}' not found.")
            return

        agent = self.agents[agent_name]
        print(f"\n{'='*60}")
        print(f"Agent: {agent.name}")
        print(f"{'='*60}")
        print(f"\nDescription: {agent.description}")
        print(f"Model: {agent.model}")
        print(f"Reasoning Budget: {agent.reasoning_budget}")
        print(f"\nInstructions:")
        print("-" * 60)
        print(agent.instructions)
        print("-" * 60 + "\n")

    def clear_history(self, agent_name: str):
        """Clear conversation history for an agent."""
        if agent_name in self.conversations:
            self.conversations[agent_name] = []
            print(f"Cleared conversation history for '{agent_name}'.")
        else:
            print(f"No conversation history for '{agent_name}'.")

    def interactive_loop(self):
        """Run the interactive CLI loop."""
        self.display_welcome()

        current_agent = None

        while True:
            try:
                if current_agent:
                    print(f"\n[{current_agent}] Enter your request (or 'menu' to see options):")
                else:
                    self.display_menu()

                user_input = self.get_user_input()

                if user_input is None:
                    continue

                if not user_input:
                    continue

                user_input_lower = user_input.lower()

                # Handle menu commands
                if user_input_lower == "exit" or user_input_lower == "quit":
                    print("\nGoodbye!")
                    break

                elif user_input_lower == "menu":
                    current_agent = None
                    continue

                elif user_input_lower == "1" or user_input_lower == "run":
                    agent_name = self.get_user_input("Enter agent name: ")
                    if agent_name in self.agents:
                        current_agent = agent_name
                    else:
                        print(f"Agent '{agent_name}' not found.")

                elif user_input_lower == "2" or user_input_lower == "details":
                    agent_name = self.get_user_input("Enter agent name: ")
                    self.view_agent_details(agent_name)

                elif user_input_lower == "3" or user_input_lower == "clear":
                    if current_agent:
                        self.clear_history(current_agent)
                    else:
                        agent_name = self.get_user_input("Enter agent name: ")
                        self.clear_history(agent_name)

                # Check if input is an agent name
                elif user_input in self.agents:
                    current_agent = user_input
                    print(f"\nSelected agent: {current_agent}")

                # Run agent with user input
                elif current_agent:
                    self.run_agent(current_agent, user_input)

                else:
                    # Try to run as agent name first
                    if user_input in self.agents:
                        current_agent = user_input
                        print(f"Selected agent: {current_agent}")
                    else:
                        print("Unknown command. Type 'menu' to see options.")

            except KeyboardInterrupt:
                print("\n\nInterrupted. Type 'exit' to quit or continue.")
            except Exception as e:
                print(f"Error: {e}")


def main():
    """Main entry point."""
    # Check for API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        print("\nSet it with:")
        print("  export ANTHROPIC_API_KEY='sk-...' (Linux/Mac)")
        print("  set ANTHROPIC_API_KEY=sk-... (Windows CMD)")
        print("  $env:ANTHROPIC_API_KEY='sk-...' (Windows PowerShell)")
        sys.exit(1)

    runner = AgentRunner()
    runner.interactive_loop()


if __name__ == "__main__":
    main()
