# Example Project Integration

The invited repositories are treated as external example sources for the Kliko showcase:

| Local path | Source repository | Purpose |
| --- | --- | --- |
| `examples/primeri` | `https://github.com/plague40404/primeri` | Static example site/reference design |
| `examples/primeri-2.0` | `https://github.com/plague40404/primeri-2.0` | Expanded example site/reference design |

## Recommended Workflow

1. Keep the example repositories as submodules in the main repository.
2. Develop or update each example in its own repository.
3. When an example is ready for the Kliko site, add a screenshot, short case description, and link in the Django `SHOWCASE` data.
4. Commit the updated submodule pointer in `kliko-site` so the main site always references a known version.

This keeps the professional site clean while preserving the history of each example project.
