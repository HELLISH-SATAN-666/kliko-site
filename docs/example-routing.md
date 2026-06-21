# Example Routing

Kliko links showcase cards to live example sites through environment variables:

```text
EXAMPLE_PRIMERI_URL=/examples/primeri/
EXAMPLE_PRIMERI_2_URL=/examples/primeri-2/
```

The production deployment serves these paths from Git submodules:

| Public URL | Source path | Source repository |
| --- | --- | --- |
| `/examples/primeri/` | `examples/primeri/` | `https://github.com/plague40404/primeri` |
| `/examples/primeri-2/` | `examples/primeri-2.0/` | `https://github.com/plague40404/primeri-2.0` |

Recommended nginx routing:

```nginx
location /examples/primeri/ {
    alias /srv/kliko-site/current/examples/primeri/;
    try_files $uri $uri/ /examples/primeri/index.html;
}

location /examples/primeri-2/ {
    alias /srv/kliko-site/current/examples/primeri-2.0/;
    try_files $uri $uri/ /examples/primeri-2/index.html;
}
```

This keeps everything under the main domain, for example:

- `https://proforin.online/examples/primeri/`
- `https://proforin.online/examples/primeri-2/`
