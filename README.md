# Ruby on Svelte
Minimal example that uses opal to be able to add ruby code to the script section of a svelte file. 

I still need to explore how to use gems and other Ruby code. Only did basic tests so far. Also since it isn't natively supported your IDE will yell at you.

P.S. Excluding the `./ruby-on-svelte` folder the rest of this is just a minimal starter template using `npx sv create`.

## Setup Example Project

Run `npm install` (or `pnpm install` or `yarn`).

Then `npm run dev` or `npm run dev -- --open`

## Example Usage

```sh
<script lang="ruby">
    # Pound sign for comments since it treats it was Ruby.

    $name = "Ruby on Svelte"

    $count = 0

    def increment
        $count += 1
    end

    # Does actually print to browser console/terminal.
    puts "Hello, #{$name}!"
</script>
```

## To add to your project:
Install `opal-compiler` via `npm` (or `pnpm install` or `yarn`).

Put `./ruby-on-svelte` wherever you want.

In your `svelte.config.js` file add this as a preprocess (the import need to be wherever you put it):

```
import { svelteRuby } from './ruby-on-svelte/svelte-ruby.js';
...

const config = {
	preprocess: [
        ...
        svelteRuby()
    ],
...
};
