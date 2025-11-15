<section>
    <div align="center">
        <img src="https://p9n2c8y2.delivery.rocketcdn.me/wp-content/uploads/2021/05/3.png.webp" width="30"/>
    </div>
    <div align="center"> 
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Ruby_logo.svg/198px-Ruby_logo.svg.png?20101129171534" width="30"/>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/500px-Svelte_Logo.svg.png?20191219133350" width="27.5"/> 
    </div>
</section>

# Ruby on Svelte
###### @ruby-on-svelte/adapter
This is a minimal example that uses Opal to be able to add Ruby code from the script section of a Svelte file. 

## 📢 Update
I decided since there's interest, I'm going to build this out into an actual Ruby adapter for Svelte.

## ⚠️ Issues
- To use Ruby within the body that gets rendered via Svelte the Ruby method needs to be a `$` global var. This is not needed if you just want to use Ruby within the `<script>` tag.
- I still need to explore how to use gems and other Ruby code. 
- Further testing is needed as I only did basic tests so far.
- Also since it isn't natively supported if you use something like VSCode then your IDE will probably yell at you. 

## 🎯 Overall Goals:
- [X] Ruby in script tags.
- [X] Ruby that transpiles to Ruby via opal.
- [X] Returned back to Svelte in something it can read.
- [X] Publish as `npm` package.
- [ ] Support .rb files including server side; ex: `+page.server.rb`.
- [ ] Compile to wasm?
- [ ] Allow usage of RubyGems?

## 📋 Recent Changelog
`v1.0.0`
- [X] Had to reorganize folders.
- [X] Published npm package; `npm install @ruby-on-svelte/adapter`.
- [X] Added `@ruby-on-svelte-adapter` folder, this is the actual npm package that is published.
- [X] The `@ruby-on-svelte` folder is what's being used in this template.

`init commit`
- [X] Ruby in script tags: `<script lang="ruby">` and `<script lang="rb">` are supported. <br>
- [X] Ruby transpiles to JavaScript via Opal, then is returned back for the Svelte compiler. <br>
- [X] Two-way store sync, doing anything that's changes in Ruby by Svelte updates and vise versa. <br>
- [X] Handles non-browser env slightly better. <br>
- [X] JavaScript naming/collision handling slightly better. <br>
- [X] Added some error handling on Svelte side too. <br>
- [X] A bit of polish on the compiler. <br>
- [X] Better structure for future improvements. <br>
- [X] Beautified this `README.md` so its not basic af. <br>

## ⚙️ Setup Example Project
###### Excluding the `./@ruby-on-svelte` folder the rest of this is just a minimal starter template using `npx sv create` and is a `sveltejs/adapter-node`.

Run `npm install` (or `pnpm install` or `yarn`).

Then `npm run dev` or `npm run dev -- --open`

## 💡 The Example will have these included `devDependencies`:
```bash
opal-compiler
svelte
sveltejs/kit
sveltejs/adapter-node
node
vite
mdsvex
eslint
prettier
typescript
tailwindcss
tailwindcss/forms
tailwindcss/typography
```

## ⚡ Install via npm:
1. Install with npm: `npm i @ruby-on-svelte/adapter` *(adds this and the opal-compiler)*
2. In your `svelte.config.js` file add this as a preprocess *(the import needs to be wherever you put the folder)* and I'm not sure yet if it matters where you put it in the preprocess list:

```js
import { RubyOnSvelte } from '@ruby-on-svelte/adapter';
...
const config = {
	preprocess: [
        ...
        RubyOnSvelte()
    ],
...
};
```

## ✨ To add to your existing project:
1. Install `opal-compiler` via `npm` (or `pnpm install` or `yarn`).
2. Put `./@ruby-on-svelte` wherever you want.
3. And again, in your `svelte.config.js` file add this as a preprocess *(the import needs to be wherever you put the folder)* and I'm not sure yet if it matters where you put it in the preprocess list:

```js
import { RubyOnSvelte } from './@ruby-on-svelte/adapter/index.js';
...
const config = {
	preprocess: [
        ...
        RubyOnSvelte()
    ],
...
};
```

## ⭐ Example Usage
```sh
<script lang="ruby">
    # Pound sign for comments since it treats it was Ruby.

    # Example One
    $count = 0

    def increment
        $count += 1
    end

    # Example Two
    $name = "Ruby on Svelte"

    # Does actually print to browser console/terminal.
    puts "Hello, #{$name}!"
</script>
```
```html
<main>
    <p> Hello {$name}! </p>
    <button on:click={increment}> Count: {$count} </button>
</main>
```

## 📦 Requiring other Ruby files
- Unfortunately `require_relative` doesn't work right now.
- But `require` does:
    - If you **DO NOT** use `loadPaths` you should have the full path listed:
        `require 'src/lib/modules/ruby/hello'`
    - If you **DO** use `loadPaths` you can shorten that to this:
        `require 'hello'`
- To use the bare `require` statements, add the directories you want on Opal's load path when wiring the adapter within `svelte.config.js`:
```js
import { RubyOnSvelte } from './@ruby-on-svelte/adapter/index.js';
...
const config = {
    preprocess: [
        RubyOnSvelte({
            loadPaths: [
                'src/lib/modules/ruby'  // <- you can add root `./` if you want but its not needed.
            ]
        })
    ]
    ...
};
```

- Within you svelte file you'll have to assign the method(s) to a svelte store if using a Ruby global var, because the Ruby gets compiled before Vite/Svelte ever sees the JavaScript. So you can't use standard `import` statements to pull in `.rb` sources. So you have to use Ruby's `require`. If that global like `$name` is defined in a required file, add a `# @store $name` in the svelte component so the adapter knows to use it as a Svelte store.
```ruby
<script lang="ruby">
    require 'hello'
    # @store $name  // <- just add this before/after and should be `#` a pound sign needs to be added.
</script>
```

## ⚖️ License
*© 2025 Vallereya* <br>
All rights reserved. <br> <br>
*Code and Contributions have **MIT License**. <br>
See **LICENSE** for more information.* <br>
