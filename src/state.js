// Game State Management with LocalStorage persistence

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentZone = 1; // 1: Study, 2: Gallery, 3: Vault
    this.player = {
      x: 7 * 32,
      y: 9 * 32,
      dir: 'up',
      frame: 0,
      isMoving: false,
      speed: 130 // pixels per second
    };

    this.inventory = [];
    this.selectedItem = null;

    // Puzzle flags
    this.flags = {
      deskUnlocked: false,
      suspectsSolved: false,
      scalesSolved: false,
      studyDoorOpen: false,

      // Zone 2
      paintingsSolved: {
        euler: false,
        fibonacci: false,
        symmetry: false,
        prism: false
      },
      laserFloorSolved: false,
      galleryDoorOpen: false,

      // Zone 3
      modularDialSolved: false,
      laserOpticsSolved: false,
      artifactSecured: false
    };

    // Relic scale slots [slot0, slot1, slot2, slot3, slot4] holds relic ids
    this.scaleSlots = [null, null, null, null, null];

    // Clue & Notebook system
    this.clues = [];
    this.notebookScratchpad = {
      // Truth table for suspects: [Butler, Scribe, Chemist, Guard] -> 'T', 'F', or null
      suspects: { butler: null, scribe: null, chemist: null, guard: null },
      notes: ''
    };

    // Stats
    this.stats = {
      startTime: Date.now(),
      hintsUsed: 0,
      puzzlesSolved: 0,
      stepsTaken: 0,
      elapsedTime: 0,
      completed: false
    };

    this.controlMode = 'auto'; // 'keyboard', 'touch', 'auto'
  }

  hasItem(id) {
    return this.inventory.some(item => item.id === id);
  }

  addItem(item) {
    if (!this.hasItem(item.id)) {
      this.inventory.push(item);
      this.addClue(`Acquired item: ${item.name}`);
      this.save();
      return true;
    }
    return false;
  }

  removeItem(id) {
    const idx = this.inventory.findIndex(item => item.id === id);
    if (idx !== -1) {
      const removed = this.inventory.splice(idx, 1)[0];
      if (this.selectedItem && this.selectedItem.id === id) {
        this.selectedItem = null;
      }
      this.save();
      return removed;
    }
    return null;
  }

  addClue(text, category = 'General') {
    if (!this.clues.some(c => c.text === text)) {
      this.clues.push({
        id: 'clue_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        text,
        category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.save();
    }
  }

  save() {
    try {
      const data = {
        currentZone: this.currentZone,
        player: this.player,
        inventory: this.inventory,
        flags: this.flags,
        scaleSlots: this.scaleSlots,
        clues: this.clues,
        notebookScratchpad: this.notebookScratchpad,
        stats: {
          ...this.stats,
          elapsedTime: this.stats.elapsedTime + (Date.now() - this.stats.startTime)
        }
      };
      localStorage.setItem('pixel_pursuit_save_v1', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save game to localStorage', e);
    }
  }

  load() {
    try {
      const raw = localStorage.getItem('pixel_pursuit_save_v1');
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.currentZone = data.currentZone || 1;
      this.player = Object.assign(this.player, data.player);
      this.inventory = data.inventory || [];
      this.flags = Object.assign(this.flags, data.flags);
      this.scaleSlots = data.scaleSlots || [null, null, null, null, null];
      this.clues = data.clues || [];
      this.notebookScratchpad = Object.assign(this.notebookScratchpad, data.notebookScratchpad);
      this.stats = Object.assign(this.stats, data.stats);
      this.stats.startTime = Date.now();
      return true;
    } catch (e) {
      console.warn('Failed to load save game', e);
      return false;
    }
  }

  clearSave() {
    localStorage.removeItem('pixel_pursuit_save_v1');
    this.reset();
  }
}

export const gameState = new GameState();
