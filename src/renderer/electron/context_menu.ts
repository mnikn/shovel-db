import * as remote from '@electron/remote';

const explorerFileActions = [
  {
    label: 'Rename',
    click: () => {
      console.log('Rename');
    },
  },
  {
    label: 'Copy',
    click: () => {
      console.log('Copy');
    },
  },
  {
    label: 'Delete',
    click: () => {
      console.log('Delete');
    },
  },
];

// Create a new menu
const menu = new remote.Menu();

explorerFileActions.forEach((item) => {
  menu.append(
    new remote.MenuItem({
      label: item.label,
      click: item.click,
    })
  );
});

// Add a listener for the contextmenu event
window.addEventListener('contextmenu', (event) => {
  // Prevent the default context menu from appearing
  event.preventDefault();

  // Show the context menu at the current mouse position
  menu.popup({ window: remote.getCurrentWindow() });
});
