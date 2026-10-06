<script lang="ts">
  import { Footnote, FootnoteRef } from "purr";
</script>

<div class="md demo">
  <p>
    Footnotes pair by id<FootnoteRef id="1" prefix="demo" />, and a prefix keeps documents apart<FootnoteRef
      id="2"
      prefix="demo"
    />.
  </p>
  <hr />
  <Footnote id="1" prefix="demo"><p>The mark links here, and back.</p></Footnote>
  <Footnote id="2" prefix="demo"><p>Two documents can each have a note 1.</p></Footnote>
</div>

<style>
  .demo {
    max-width: 420px;
  }
</style>
