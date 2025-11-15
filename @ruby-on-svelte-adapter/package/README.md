# @ruby-on-svelte/adapter
Let's you use Ruby in Svelte!

## ⚡ Usage
Install with `npm i @ruby-on-svelte/adapter`.

```js
// svelte.config.js
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

## ⚙️ Options
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