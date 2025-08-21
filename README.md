# Browze

Browze is a minimal personal start page that combines quick search, handy links, and basic productivity tools. Everything runs entirely in the browser and persists in local storage.

## Features

- **Time‑aware greeting and clock.** A friendly message updates with the current time and your name. You can toggle an animated background if motion is distracting.
- **Customizable search bar.** Choose between Google, DuckDuckGo, Brave, Wikipedia, or YouTube. Press `/` to jump to the search box.
- **Quick links.** Launch common sites like Gmail or GitHub with one click.
- **To‑do manager.** Add tasks with optional due dates and priorities, mark them complete, drag to reorder, and export or import tasks as JSON.
- **Calendar & deadlines.** Track due dates or reminders on a monthly calendar, view upcoming items, and export or import events.

## Getting started

1. Clone this repository.
2. Open `index.html` in a modern web browser.

No build step or server is required; the app is static.

## Customization

- Change the displayed name by editing the `USER_NAME` constant in `app.js`.
- Update the default quick links or add more search engines by modifying `index.html` and `app.js`.
- The background animation setting is stored in local storage and can be toggled with the on-page button.

## Data persistence

All tasks and events are saved to your browser's local storage. Use the export/import buttons in each panel to back up or restore your data.

## Contributing

Issues and feature requests are welcome. Feel free to fork the project and submit a pull request with improvements.

## License

This project is shared without a specific license. Use it as a personal starting point or adapt it for your own needs.
