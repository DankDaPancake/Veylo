# RTK Command Guidance

RTK (Rust Token Killer) is an optional command-output proxy referenced by the repository instructions. Its availability is machine-specific; it is not an application dependency.

- If `rtk` is available, verify `rtk --version` and `rtk gain` before relying on it. A different tool can use the same executable name.
- Use RTK's supported equivalents for routine commands when they preserve the output required for the task. RTK meta commands such as `rtk gain` run directly.
- If RTK is unavailable, run the ordinary commands and keep output focused; do not block repository work or install a global tool automatically.
- Do not assume a Claude Code rewrite hook exists in other agents or shells.
- When exact output is needed, use the original command or `rtk proxy <command>` if supported by the installed version.

On the machine used for the initial repository setup, `rtk` was not found on PATH. No RTK installation or global hook changes were made.
