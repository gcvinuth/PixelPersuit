// Zone Layouts, Tilemaps, Collisions, and Interactable Object Definitions

export const ZONES = {
  // ZONE 1: THE PRIVATE STUDY
  1: {
    name: "The Private Study",
    width: 15,
    height: 12,
    bgMusicZone: 1,
    spawn: { x: 7 * 32, y: 9 * 32, dir: 'up' },
    
    // 0: Walkable Floor, 1: Wall/Solid, 2: Interactive Object
    // 15 columns x 12 rows
    collision: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,1,2,2,2,2,1,2,2,1,2,2,1], // Desks, Portraits, Bookshelves
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1], // Fireplace on Left, Clock on Right
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,2,2,2,2,2,0,0,0,0,0,1], // Scales Pedestal (5 slots)
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,2,2,0,0,0,0,0,0,1], // Door to Gallery at bottom center
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],

    interactables: [
      {
        id: 'desk_bureau',
        name: "Baron's Roll-Top Writing Desk",
        x: 1 * 32,
        y: 1 * 32,
        w: 64,
        h: 32,
        prompt: "Inspect writing desk",
        type: 'desk'
      },
      {
        id: 'portraits_confidants',
        name: "Portraits of the Four Confidants",
        x: 4 * 32,
        y: 1 * 32,
        w: 128,
        h: 32,
        prompt: "Examine portrait gallery",
        type: 'suspects'
      },
      {
        id: 'study_bookshelf',
        name: "Mahogany Mathematical Archive",
        x: 9 * 32,
        y: 1 * 32,
        w: 64,
        h: 32,
        prompt: "Read leatherbound tomes",
        type: 'bookshelf'
      },
      {
        id: 'study_door_right',
        name: "Steel-Reinforced Study Exit",
        x: 12 * 32,
        y: 1 * 32,
        w: 64,
        h: 32,
        prompt: "Inspect Gallery door",
        type: 'study_door'
      },
      {
        id: 'study_fireplace',
        name: "Victorian Stone Fireplace",
        x: 1 * 32,
        y: 3 * 32,
        w: 32,
        h: 32,
        prompt: "Examine hearth embers",
        type: 'fireplace'
      },
      {
        id: 'study_clock',
        name: "Grandfather Astronomical Clock",
        x: 13 * 32,
        y: 3 * 32,
        w: 32,
        h: 32,
        prompt: "Inspect clock face",
        type: 'clock'
      },
      {
        id: 'study_scales',
        name: "The Five Pedestal Scales of Equilibrium",
        x: 4 * 32,
        y: 5 * 32,
        w: 160,
        h: 32,
        prompt: "Align weight relics",
        type: 'scales'
      },
      {
        id: 'study_exit_gallery',
        name: "Passage to the Art Gallery",
        x: 6 * 32,
        y: 10 * 32,
        w: 64,
        h: 32,
        prompt: "Advance to Art Gallery",
        type: 'door_to_gallery'
      }
    ]
  },

  // ZONE 2: THE ART GALLERY
  2: {
    name: "The Grand Art Gallery",
    width: 16,
    height: 13,
    bgMusicZone: 2,
    spawn: { x: 7 * 32, y: 11 * 32, dir: 'up' },

    collision: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,1,2,1,2,1,2,1,2,2,1,2,1,2,1], // 4 Masterpiece Paintings & Spotlights
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1], // Velvet stanchions
      [1,0,0,0,2,2,2,2,2,0,0,0,0,0,0,1], // Laser Floor Grid (5x5) row 0
      [1,0,0,0,2,2,2,2,2,0,0,0,0,0,0,1], // row 1
      [1,0,0,0,2,2,2,2,2,0,0,0,0,0,0,1], // row 2
      [1,0,0,0,2,2,2,2,2,0,0,0,0,0,0,1], // row 3
      [1,0,0,0,2,2,2,2,2,0,0,0,0,0,0,1], // row 4
      [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,2,2,0,0,0,0,0,0,1], // Passage back to Study / forward
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],

    interactables: [
      {
        id: 'painting_euler',
        name: "Masterpiece I: 'Euler's Topology'",
        x: 1 * 32,
        y: 1 * 32,
        w: 32,
        h: 32,
        prompt: "Examine Planar Graph",
        type: 'painting_euler'
      },
      {
        id: 'painting_fibonacci',
        name: "Masterpiece II: 'Spiral of the Primes'",
        x: 3 * 32,
        y: 1 * 32,
        w: 32,
        h: 32,
        prompt: "Examine Prime Spiral",
        type: 'painting_fibonacci'
      },
      {
        id: 'painting_symmetry',
        name: "Masterpiece III: 'The Permutation Matrix'",
        x: 5 * 32,
        y: 1 * 32,
        w: 32,
        h: 32,
        prompt: "Examine Symmetry Grid",
        type: 'painting_symmetry'
      },
      {
        id: 'painting_prism',
        name: "Masterpiece IV: 'The Anamorphic Diamond'",
        x: 7 * 32,
        y: 1 * 32,
        w: 32,
        h: 32,
        prompt: "Examine Prism Angles",
        type: 'painting_prism'
      },
      {
        id: 'vault_blast_door_preview',
        name: "Titanium Vault Gate",
        x: 9 * 32,
        y: 0 * 32,
        w: 64,
        h: 64,
        prompt: "Approach Vault Blast Door",
        type: 'door_to_vault'
      },
      {
        id: 'gallery_laser_grid',
        name: "Laser Security Stepping Floor",
        x: 4 * 32,
        y: 4 * 32,
        w: 160,
        h: 160,
        prompt: "Access Laser Floor Controls",
        type: 'laser_floor'
      },
      {
        id: 'gallery_door_back',
        name: "Passage back to Private Study",
        x: 7 * 32,
        y: 12 * 32,
        w: 64,
        h: 32,
        prompt: "Return to Study",
        type: 'door_back_to_study'
      }
    ]
  },

  // ZONE 3: THE FINAL VAULT
  3: {
    name: "The Subterranean Vault",
    width: 16,
    height: 12,
    bgMusicZone: 3,
    spawn: { x: 7 * 32, y: 9 * 32, dir: 'up' },

    collision: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,1,0,0,2,2,2,2,0,0,1,2,2,1], // Modulo Terminal, Central Pedestal, Optics Terminal
      [1,2,2,1,0,0,2,2,2,2,0,0,1,2,2,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,2,2,0,0,0,0,0,0,1], // Door back to Gallery
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],

    interactables: [
      {
        id: 'vault_modular_terminal',
        name: "Concentric Modulo Rotor Lock",
        x: 1 * 32,
        y: 1 * 32,
        w: 64,
        h: 64,
        prompt: "Calibrate Modulo Rotors",
        type: 'terminal_modular'
      },
      {
        id: 'vault_pedestal_oculus',
        name: "Crystalline Forcefield: Chronos Oculus",
        x: 6 * 32,
        y: 1 * 32,
        w: 128,
        h: 64,
        prompt: "Retrieve Chronos Oculus",
        type: 'pedestal_artifact'
      },
      {
        id: 'vault_optics_terminal',
        name: "Quantum Laser Deflector Matrix",
        x: 13 * 32,
        y: 1 * 32,
        w: 64,
        h: 64,
        prompt: "Align Laser Mirrors",
        type: 'terminal_optics'
      },
      {
        id: 'vault_door_back',
        name: "Passage back to Art Gallery",
        x: 7 * 32,
        y: 10 * 32,
        w: 64,
        h: 32,
        prompt: "Return to Art Gallery",
        type: 'door_back_to_gallery'
      }
    ]
  }
};
