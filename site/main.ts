import "purr/fonts.css";
import "purr/styles.css";
import "./site.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { paint, setTouch, touch } from "./lib/site.svelte";

// Painted before mounting, so the first frame is already in the remembered theme.
paint();
setTouch(touch.on);

mount(App, { target: document.getElementById("app")! });
