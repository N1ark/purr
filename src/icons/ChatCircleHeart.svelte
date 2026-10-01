<script lang="ts">
  // Phosphor's chat-circle with a heart inside, which Phosphor lacks; see ChatMark.
  import type { IconComponentProps } from "phosphor-svelte";
  import ChatMark from "./ChatMark.svelte";

  const props: IconComponentProps = $props();
</script>

<ChatMark mark="heart" {...props} />
