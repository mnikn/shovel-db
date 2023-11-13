import { saveProject } from '.';
import ipc from '../electron/ipc';
import { EVENT, eventEmitter } from '../events';

/**
 * Chrome KeyboardEvent.code value map to key
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
 */
const CODES = {
  AltLeft: 'Alt',
  AltRight: 'Alt',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  ArrowUp: 'Up',
  Backquote: '`',
  Backslash: '\\',
  Backspace: 'Backspace',
  BracketLeft: '[',
  BracketRight: ']',
  CapsLock: 'CapsLock',
  Comma: ',',
  ControlLeft: 'Ctrl',
  ControlRight: 'Ctrl',
  Delete: 'Delete',
  Digit0: '0',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  End: 'End',
  Enter: 'Enter',
  Equal: '=',
  Escape: 'Escape',
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
  F13: 'F13',
  F14: 'F14',
  F15: 'F15',
  F16: 'F16',
  F17: 'F17',
  F18: 'F18',
  F19: 'F19',
  F20: 'F20',
  F21: 'F21',
  F22: 'F22',
  F23: 'F23',
  F24: 'F24',
  Home: 'Home',
  Insert: 'Insert',
  KeyA: 'A',
  KeyB: 'B',
  KeyC: 'C',
  KeyD: 'D',
  KeyE: 'E',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyI: 'I',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',
  KeyM: 'M',
  KeyN: 'N',
  KeyO: 'O',
  KeyP: 'P',
  KeyQ: 'Q',
  KeyR: 'R',
  KeyS: 'S',
  KeyT: 'T',
  KeyU: 'U',
  KeyV: 'V',
  KeyW: 'W',
  KeyX: 'X',
  KeyY: 'Y',
  KeyZ: 'Z',
  Minus: '-',
  NumLock: 'NumLock',
  Numpad0: 'Numpad0',
  Numpad1: 'Numpad1',
  Numpad2: 'Numpad2',
  Numpad3: 'Numpad3',
  Numpad4: 'Numpad4',
  Numpad5: 'Numpad5',
  Numpad6: 'Numpad6',
  Numpad7: 'Numpad7',
  Numpad8: 'Numpad8',
  Numpad9: 'Numpad9',
  NumpadAdd: 'NumpadAdd',
  NumpadComma: 'NumpadComma',
  NumpadDecimal: 'NumpadDecimal',
  NumpadDivide: 'NumpadDivide',
  NumpadEnter: 'NumpadEnter',
  NumpadEqual: 'NumpadEqual',
  NumpadMultiply: 'NumpadMultiply',
  NumpadSubtract: 'NumpadSubtract',
  PageDown: 'PageDown',
  PageUp: 'PageUp',
  Period: '.',
  PrintScreen: 'PrintScreen',
  Quote: "'",
  ScrollLock: 'ScrollLock',
  Semicolon: ';',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  Space: 'Space',
  Tab: 'Tab',
  Slash: '/',
};

const shortcuts = {
  'story-editor': [
    {
      keybinding: 'Ctrl+S',
      fn: () => saveProject(),
    },
    {
      keybinding: 'Ctrl+P',
      fn: () => {
        eventEmitter.emit(EVENT.TOGGLE_SEARCH_PANEL);
      },
    },
    {
      keybinding: 'Ctrl+Shift+P',
      fn: () => {
        eventEmitter.emit(EVENT.TOGGLE_COMMAND_PANEL);
      },
    },
  ],
  'static-data-editor': [
    {
      keybinding: 'Ctrl+S',
      fn: () => saveProject(),
    },
    {
      keybinding: 'Ctrl+P',
      fn: () => {
        eventEmitter.emit(EVENT.TOGGLE_SEARCH_PANEL);
      },
    },
    {
      keybinding: 'Ctrl+Shift+P',
      fn: () => {
        eventEmitter.emit(EVENT.TOGGLE_COMMAND_PANEL);
      },
    },
  ],
};

const init = () => {
  window.addEventListener('keyup', (event) => {
    const keyModifiers = {
      alt: event.altKey,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    };
    const key = CODES[event.code];

    const shortcutGroup = shortcuts['static-data-editor'];
    const matchShortcut = shortcutGroup.find((shortcut) => {
      const keybindKeys = shortcut.keybinding.split('+');
      return (
        keybindKeys.filter((keybindKey) => {
          if (keybindKey === 'Ctrl' && keyModifiers.ctrl) {
            return true;
          }
          if (keybindKey === 'Alt' && keyModifiers.alt) {
            return true;
          }
          if (keybindKey === 'Shift' && keyModifiers.shift) {
            return true;
          }
          if (keybindKey === 'Meta' && keyModifiers.meta) {
            return true;
          }
          return keybindKey === key;
        }).length === keybindKeys.length
      );
    });

    if (matchShortcut) {
      matchShortcut.fn();
    }
  });
};

export default {
  init,
};
