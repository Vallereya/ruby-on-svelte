<script lang="ruby">
    # Pound sign for comments since it treats it was Ruby.
    # Doesn't recognize any variables without `$`? haven't tested much yet.
    $name = "Ruby on Svelte"

    $count = 0

    def increment
        $count += 1
    end

    # Does actually print to browser console/terminal.
    puts "Hello, #{$name}!"
</script>

<main>
    <h1>
        Hello {$name}!
    </h1>

    <button on:click={increment}>
        Count: {$count}
    </button>
</main>

<style>
    button {
        background-color: #BC002D;
        color: #F1F1F1;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>
