export const kv = await Deno.openKv();

export type GuestbookEntryInput = {
  name: string;
  message: string;
};

export type GuestbookEntry = GuestbookEntryInput & {
  id: string;
  created: string;
};

export const createGuestbookEntry = async (entry: GuestbookEntryInput) => {
  const id = crypto.randomUUID();
  const created = new Date().toISOString();

  const data = {
    ...entry,
    id,
    created,
  };

  await kv.set(["guestbook", id], data);

  return data as GuestbookEntry;
};

export const getGuestbookEntries = async () => {
  const iter = kv.list({ prefix: ["guestbook"] });
  const entries = [];
  const data: GuestbookEntry[] = [];

  for await (const entry of iter) {
    const value = entry.value as GuestbookEntry;
    data.push(value);
  }
  // Sort by created date
  data.sort((a, b) => {
    if (new Date(a.created) > new Date(b.created)) {
      return -1;
    } else if (new Date(a.created) < new Date(b.created)) {
      return 1;
    } else {
      return 0;
    }
  });

  for await (const value of data) {
    entries.push(
      `<div class="bg-white p-4 mb-3 text-gray-700 rounded-lg shadow-md">
    <div class="avatar"></div>
    <h3 class="text-xl font-semibold">${
        value.name.replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      }</h3>
    <p class="text-gray-700 mt-2">${
        value.message.replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      }</p>
    <span class="text-gray-500 mt-2">${
        new Date(value.created).toLocaleString()
      }</span>
  </div>`,
    );
  }

  return entries.join("");
};
