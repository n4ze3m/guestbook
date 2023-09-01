import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { createGuestbookEntry, getGuestbookEntries } from "./utils/kv.ts";

const app = new Application();
const port = 8080;
const router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

router.post("/submit", async (context) => {
  const form = await context.request.body().value;
  const requiredFields = ["name", "message", "g-recaptcha-response"];

  for (const field of requiredFields) {
    if (!form.has(field) || form.get(field) === "") {
      context.response.body =
        `<span class="text-red-500">Missing ${field}</span>`;
      return;
    }
  }

  const name = form.get("name").replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const message = form.get("message").replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  await createGuestbookEntry({ name, message });

  context.response.body =
    `<span class="text-green-500">Successfully submitted</span>`;
});

router.get("/entries", async (context) => {
  const entries = await getGuestbookEntries();
  context.response.body = entries;
});

app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/public/`,
    index: "index.html",
  });
});

console.log("Listening at http://localhost:" + port);
await app.listen({ port });
