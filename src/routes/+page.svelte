<script lang="ruby">
    require 'hello'
    # @store $name

    puts "Hello, #{$name}!"

    $count = 0

    def increment
        $count += 1
    end
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
