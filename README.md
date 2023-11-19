# froget

Get the frogs

You will need to log in the first time. To do that, you will need to edit the
script. By default, the script will run in headless mode. This runs a browser
without creating a window. But to log in, we will need to set headless mode to
false. This will open a browser window where you can log in.

A directory `user_data` will be created in the current directory. This is the
browser state, essentially. You can copy this directory and use it on the
computer where you will run the script.

The first log line or two might be empty. This is normal. The page takes a
while to load. After a minute or so, it should hve loaded, and you should see
the text from the search buttons.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.11. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
