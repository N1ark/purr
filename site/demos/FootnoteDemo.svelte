<script lang="ts">
  import { Footnote, FootnoteRef } from "purr";
</script>

<div class="md demo">
  <p>
    Purr's palette came from a website<FootnoteRef id="1" prefix="demo" />, and its prose class grew
    out of a chat client<FootnoteRef id="2" prefix="demo" />.
  </p>
  <hr />
  <Footnote id="1" prefix="demo"><p>n1ark.com, which now uses purr in turn.</p></Footnote>
  <Footnote id="2" prefix="demo"><p>Tulip, a Zulip client.</p></Footnote>
</div>

<style>
  .demo {
    max-width: 420px;
  }
</style>
