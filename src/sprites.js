// Procedural Pixel Art Sprite & Texture Generator
// Creates crisp, zero-artifact 16x16, 24x32, and 32x32 sprites cached onto Offscreen Canvases

export class SpriteManager {
  constructor() {
    this.cache = new Map();
    this.init();
  }

  init() {
    this.generatePlayerSprites();
    this.generateTileSprites();
    this.generateItemSprites();
    this.generateFurnitureSprites();
  }

  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx };
  }

  // --- PLAYER SPRITES: Lyra Vance (The Phantom Thief) ---
  // Directions: 'down', 'up', 'left', 'right'; Frames: 0 (idle), 1 (step L), 2 (step R)
  generatePlayerSprites() {
    const directions = ['down', 'up', 'left', 'right'];
    const w = 24;
    const h = 32;

    directions.forEach((dir) => {
      for (let frame = 0; frame < 3; frame++) {
        const { canvas, ctx } = this.createCanvas(w, h);
        this.drawLyraFrame(ctx, dir, frame);
        this.cache.set(`player_${dir}_${frame}`, canvas);
      }
    });
  }

  drawLyraFrame(ctx, dir, frame) {
    // Palette
    const coat = '#1b3b36'; // Dark viridian trenchcoat
    const coatShadow = '#0f2421';
    const coatLight = '#2d5c54';
    const skin = '#f6d7b0';
    const hat = '#141c24';
    const hatBand = '#d97706';
    const cyanEye = '#22d3ee';
    const pants = '#1e293b';
    const boots = '#0f172a';

    const bob = (frame === 1 || frame === 2) ? -1 : 0;
    const legOffset = frame === 1 ? -2 : (frame === 2 ? 2 : 0);

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(12, 30, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (dir === 'down') {
      // Legs / Boots
      ctx.fillStyle = boots;
      ctx.fillRect(8, 27, 3, 4 + (frame === 1 ? -1 : 0));
      ctx.fillRect(13, 27, 3, 4 + (frame === 2 ? -1 : 0));

      // Coat Body
      ctx.fillStyle = coat;
      ctx.fillRect(7, 13 + bob, 10, 14);
      // Coat Shadow folds
      ctx.fillStyle = coatShadow;
      ctx.fillRect(7, 22 + bob, 10, 5);
      ctx.fillRect(11, 15 + bob, 2, 12);
      // Coat Collar highlights
      ctx.fillStyle = coatLight;
      ctx.fillRect(8, 14 + bob, 2, 6);
      ctx.fillRect(14, 14 + bob, 2, 6);

      // Belt & Brass buckle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, 20 + bob, 10, 2);
      ctx.fillStyle = hatBand;
      ctx.fillRect(11, 20 + bob, 2, 2);

      // Face / Chin
      ctx.fillStyle = skin;
      ctx.fillRect(9, 9 + bob, 6, 5);

      // Glowing Cyan Monocle (Right eye)
      ctx.fillStyle = cyanEye;
      ctx.fillRect(12, 10 + bob, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(13, 10 + bob, 1, 1);

      // Trench Hat / Fedora
      ctx.fillStyle = hat;
      ctx.fillRect(5, 7 + bob, 14, 3); // Brim
      ctx.fillRect(7, 3 + bob, 10, 4); // Crown
      ctx.fillStyle = hatBand;
      ctx.fillRect(7, 6 + bob, 10, 1); // Hatband
    } 
    else if (dir === 'up') {
      // Legs / Boots
      ctx.fillStyle = boots;
      ctx.fillRect(8, 27, 3, 4 + (frame === 1 ? -1 : 0));
      ctx.fillRect(13, 27, 3, 4 + (frame === 2 ? -1 : 0));

      // Back of Coat
      ctx.fillStyle = coat;
      ctx.fillRect(7, 13 + bob, 10, 14);
      ctx.fillStyle = coatShadow;
      ctx.fillRect(8, 16 + bob, 8, 11);
      ctx.fillRect(11, 14 + bob, 2, 13); // Center seam

      // Back of Hat & Hair
      ctx.fillStyle = hat;
      ctx.fillRect(5, 7 + bob, 14, 3);
      ctx.fillRect(7, 3 + bob, 10, 4);
      ctx.fillStyle = hatBand;
      ctx.fillRect(7, 6 + bob, 10, 1);
    } 
    else if (dir === 'left') {
      // Legs walking profile
      ctx.fillStyle = boots;
      ctx.fillRect(10 + legOffset, 27, 4, 4);
      ctx.fillRect(10 - legOffset, 27, 4, 4);

      // Coat profile
      ctx.fillStyle = coat;
      ctx.fillRect(7, 13 + bob, 9, 14);
      ctx.fillStyle = coatShadow;
      ctx.fillRect(12, 15 + bob, 4, 12);

      // Profile Face & Monocle
      ctx.fillStyle = skin;
      ctx.fillRect(8, 9 + bob, 5, 5);
      ctx.fillStyle = cyanEye;
      ctx.fillRect(8, 10 + bob, 2, 2);

      // Hat
      ctx.fillStyle = hat;
      ctx.fillRect(5, 7 + bob, 13, 3);
      ctx.fillRect(7, 3 + bob, 9, 4);
      ctx.fillStyle = hatBand;
      ctx.fillRect(7, 6 + bob, 9, 1);
    } 
    else if (dir === 'right') {
      // Legs walking profile
      ctx.fillStyle = boots;
      ctx.fillRect(10 - legOffset, 27, 4, 4);
      ctx.fillRect(10 + legOffset, 27, 4, 4);

      // Coat profile
      ctx.fillStyle = coat;
      ctx.fillRect(8, 13 + bob, 9, 14);
      ctx.fillStyle = coatShadow;
      ctx.fillRect(8, 15 + bob, 4, 12);

      // Profile Face & Monocle
      ctx.fillStyle = skin;
      ctx.fillRect(11, 9 + bob, 5, 5);
      ctx.fillStyle = cyanEye;
      ctx.fillRect(14, 10 + bob, 2, 2);

      // Hat
      ctx.fillStyle = hat;
      ctx.fillRect(6, 7 + bob, 13, 3);
      ctx.fillRect(8, 3 + bob, 9, 4);
      ctx.fillStyle = hatBand;
      ctx.fillRect(8, 6 + bob, 9, 1);
    }
  }

  // --- ENVIRONMENT TILES (32x32) ---
  generateTileSprites() {
    // 1. Study Floor: Rich Parquet Mahogany Wood
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 0, 32, 32);
      // Wood plank lines
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillRect(16, 16, 16, 16);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillRect(18, 18, 12, 12);
      // Subtle wood grain
      ctx.fillStyle = '#290e02';
      ctx.fillRect(0, 15, 32, 1);
      ctx.fillRect(15, 0, 1, 32);
      this.cache.set('tile_study_floor', canvas);
    }

    // 2. Study Wall: Dark Oak Paneling with Gold Bevel
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#2a1205';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#3d1c0a';
      ctx.fillRect(2, 2, 28, 28);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.strokeRect(4.5, 4.5, 23, 23);
      ctx.fillStyle = '#1c0b03';
      ctx.fillRect(0, 30, 32, 2);
      this.cache.set('tile_study_wall', canvas);
    }

    // 3. Gallery Floor: Polished Marble Checkerboard with Specular Sheen
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillRect(16, 16, 16, 16);
      // Marble veins
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 4, 8, 1);
      ctx.fillRect(6, 5, 6, 1);
      ctx.fillRect(18, 20, 8, 1);
      // Specular glint
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(4, 4, 2, 2);
      ctx.fillRect(20, 20, 2, 2);
      this.cache.set('tile_gallery_floor', canvas);
    }

    // 4. Gallery Wall: Royal Obsidian with Gold Filigree
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(2, 2, 28, 28);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(2, 2, 28, 2);
      ctx.fillRect(2, 16, 28, 1);
      this.cache.set('tile_gallery_wall', canvas);
    }

    // 5. Gallery Laser Step Tiles: Inactive, Active Danger, Stepped Safe
    {
      // Inactive
      const { canvas: c1, ctx: ctx1 } = this.createCanvas(32, 32);
      ctx1.fillStyle = '#1e293b';
      ctx1.fillRect(0, 0, 32, 32);
      ctx1.strokeStyle = '#38bdf8';
      ctx1.lineWidth = 2;
      ctx1.strokeRect(3, 3, 26, 26);
      ctx1.fillStyle = '#0284c7';
      ctx1.fillRect(12, 12, 8, 8);
      this.cache.set('tile_laser_idle', c1);

      // Active / Danger (Red beam)
      const { canvas: c2, ctx: ctx2 } = this.createCanvas(32, 32);
      ctx2.fillStyle = '#450a0a';
      ctx2.fillRect(0, 0, 32, 32);
      ctx2.strokeStyle = '#ef4444';
      ctx2.lineWidth = 2;
      ctx2.strokeRect(3, 3, 26, 26);
      ctx2.fillStyle = '#f87171';
      ctx2.fillRect(12, 12, 8, 8);
      this.cache.set('tile_laser_danger', c2);

      // Stepped / Safe Path (Glowing Amber/Gold)
      const { canvas: c3, ctx: ctx3 } = this.createCanvas(32, 32);
      ctx3.fillStyle = '#451a03';
      ctx3.fillRect(0, 0, 32, 32);
      ctx3.strokeStyle = '#f59e0b';
      ctx3.lineWidth = 2;
      ctx3.strokeRect(3, 3, 26, 26);
      ctx3.fillStyle = '#fbbf24';
      ctx3.fillRect(10, 10, 12, 12);
      this.cache.set('tile_laser_safe', c3);
    }

    // 6. Vault Floor: Titanium Hexagonal Panels with Glowing Conduits
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, 2, 28, 28);
      // Neon cyan energy circuit lines
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(15, 0, 2, 32);
      ctx.fillRect(0, 15, 32, 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(14, 14, 4, 4);
      this.cache.set('tile_vault_floor', canvas);
    }

    // 7. Vault Wall: Heavy Reinforced Bulkhead with Warning Stripes
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#334155';
      ctx.fillRect(2, 2, 28, 28);
      // Hazard diagonal stripes
      ctx.fillStyle = '#eab308';
      for (let i = -16; i < 48; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 2);
        ctx.lineTo(i + 4, 2);
        ctx.lineTo(i - 2, 10);
        ctx.lineTo(i - 6, 10);
        ctx.fill();
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 28, 32, 4);
      this.cache.set('tile_vault_wall', canvas);
    }
  }

  // --- FURNITURE & INTERACTIVE OBJECTS ---
  generateFurnitureSprites() {
    // 1. Bookshelf (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#3e1f0e';
      ctx.fillRect(0, 0, 32, 32);
      // 3 Shelves
      ctx.fillStyle = '#230e04';
      ctx.fillRect(2, 10, 28, 2);
      ctx.fillRect(2, 20, 28, 2);
      ctx.fillRect(2, 30, 28, 2);
      // Books of varying colors
      const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#0284c7'];
      let bx = 3;
      for (let s = 0; s < 3; s++) {
        bx = 3;
        while (bx < 27) {
          const bw = 2 + Math.floor(Math.random() * 3);
          const col = bookColors[(bx + s) % bookColors.length];
          ctx.fillStyle = col;
          ctx.fillRect(bx, s * 10 + 2, bw, 8);
          bx += bw + 1;
        }
      }
      this.cache.set('furniture_bookshelf', canvas);
    }

    // 2. Writing Desk with Banker's Lamp (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      // Wooden desk body
      ctx.fillStyle = '#5c2b0c';
      ctx.fillRect(2, 6, 28, 22);
      ctx.fillStyle = '#7c3f15';
      ctx.fillRect(4, 8, 24, 18);
      // Drawers
      ctx.fillStyle = '#3a1805';
      ctx.fillRect(5, 12, 10, 12);
      ctx.fillRect(17, 12, 10, 12);
      // Brass knobs
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(9, 17, 2, 2);
      ctx.fillRect(21, 17, 2, 2);
      // Green banker's lamp
      ctx.fillStyle = '#10b981';
      ctx.fillRect(6, 3, 6, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(8, 6, 2, 2);
      this.cache.set('furniture_desk', canvas);
    }

    // 3. Grandfather Clock (32x48 rendered onto 32x48)
    {
      const { canvas, ctx } = this.createCanvas(32, 48);
      ctx.fillStyle = '#3a1705';
      ctx.fillRect(6, 2, 20, 44);
      ctx.fillStyle = '#5c280b';
      ctx.fillRect(8, 4, 16, 40);
      // Clock face
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(16, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(15, 8, 2, 5); // Clock hand
      ctx.fillRect(15, 12, 4, 2);
      // Pendulum glass & brass weight
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(10, 22, 12, 18);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(16, 32, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(15, 23, 2, 9);
      this.cache.set('furniture_clock', canvas);
    }

    // 4. Fireplace with animated flame frames (32x32, 3 frames)
    for (let f = 0; f < 3; f++) {
      const { canvas, ctx } = this.createCanvas(32, 32);
      // Stone mantle
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 2, 28, 28);
      ctx.fillStyle = '#334155';
      ctx.fillRect(4, 4, 24, 24);
      // Firebox hearth
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, 12, 20, 16);
      // Animated fire logs & flames
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 24, 16, 3);
      // Flames
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(8, 24);
      ctx.lineTo(12 + (f === 1 ? 2 : 0), 14 + (f === 2 ? -2 : 0));
      ctx.lineTo(16, 24);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(14, 24);
      ctx.lineTo(16 + (f === 0 ? 1 : -1), 16 + (f === 1 ? -3 : 0));
      ctx.lineTo(22, 24);
      ctx.fill();
      this.cache.set(`furniture_fireplace_${f}`, canvas);
    }

    // 5. Four Confidants Portraits (32x32 each)
    const portraits = [
      { id: 'butler', name: 'The Butler', frameColor: '#d97706', coatColor: '#1e293b', hair: '#94a3b8' },
      { id: 'scribe', name: 'The Scribe', frameColor: '#d97706', coatColor: '#065f46', hair: '#78350f' },
      { id: 'chemist', name: 'The Chemist', frameColor: '#d97706', coatColor: '#4c1d95', hair: '#e2e8f0' },
      { id: 'guard', name: 'The Guard', frameColor: '#d97706', coatColor: '#991b1b', hair: '#1e293b' }
    ];

    portraits.forEach((p) => {
      const { canvas, ctx } = this.createCanvas(32, 32);
      // Gold ornate frame
      ctx.fillStyle = p.frameColor;
      ctx.fillRect(2, 2, 28, 28);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 4, 24, 24);
      // Canvas background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(6, 6, 20, 20);
      // Bust portrait silhouette
      ctx.fillStyle = p.coatColor;
      ctx.fillRect(9, 18, 14, 8);
      // Head
      ctx.fillStyle = '#f6d7b0';
      ctx.fillRect(11, 10, 10, 9);
      // Hair
      ctx.fillStyle = p.hair;
      ctx.fillRect(10, 8, 12, 4);
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(13, 13, 2, 2);
      ctx.fillRect(17, 13, 2, 2);
      this.cache.set(`portrait_${p.id}`, canvas);
    });

    // 6. Balance Scales Pedestal (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      // Stone marble pedestal
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, 18, 24, 12);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(6, 20, 20, 8);
      // Brass scales
      ctx.fillStyle = '#d97706';
      ctx.fillRect(15, 4, 2, 14); // Stem
      ctx.fillRect(8, 7, 16, 2);  // Crossbar
      // Left pan & right pan
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(7, 12, 6, 2);
      ctx.fillRect(19, 12, 6, 2);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(9, 9, 1, 3);
      ctx.fillRect(22, 9, 1, 3);
      this.cache.set('pedestal_scales', canvas);
    }

    // 7. Velvet Ropes & Brass Stanchions (Gallery)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      // Brass poles
      ctx.fillStyle = '#d97706';
      ctx.fillRect(4, 14, 4, 16);
      ctx.fillRect(24, 14, 4, 16);
      // Brass finials
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(6, 13, 3, 0, Math.PI * 2);
      ctx.arc(26, 13, 3, 0, Math.PI * 2);
      ctx.fill();
      // Velvet hanging swag rope
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(6, 14);
      ctx.quadraticCurveTo(16, 24, 26, 14);
      ctx.stroke();
      this.cache.set('gallery_velvet_rope', canvas);
    }

    // 8. Gallery Masterpiece Paintings (32x32 wall icons)
    const galleryPaintings = ['euler', 'fibonacci', 'symmetry', 'prism'];
    galleryPaintings.forEach((pId, idx) => {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#f59e0b'; // Gilded ornate frame
      ctx.fillRect(2, 2, 28, 28);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, 4, 24, 24);

      if (pId === 'euler') {
        // Geometric planar graph network
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(8, 8, 16, 16);
        ctx.beginPath();
        ctx.moveTo(8, 8); ctx.lineTo(24, 24);
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        [8, 24].forEach(x => [8, 24].forEach(y => {
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }));
      } else if (pId === 'fibonacci') {
        // Golden spiral
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(16, 16, 8, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(15, 15, 3, 3);
      } else if (pId === 'symmetry') {
        // Symmetry matrix
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(8, 8, 6, 6);
        ctx.fillRect(18, 18, 6, 6);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(18, 8, 6, 6);
        ctx.fillRect(8, 18, 6, 6);
      } else if (pId === 'prism') {
        // Refracting prism
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(16, 8); ctx.lineTo(24, 22); ctx.lineTo(8, 22); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(4, 18); ctx.lineTo(16, 15); ctx.stroke();
      }
      this.cache.set(`painting_${pId}`, canvas);
    });

    // 9. Final Vault Blast Door (64x64)
    {
      const { canvas, ctx } = this.createCanvas(64, 64);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, 56, 56);
      // Large circular vault wheel
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Vault wheel spokes & center keylock
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(32, 14); ctx.lineTo(32, 50);
      ctx.moveTo(14, 32); ctx.lineTo(50, 32);
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(32, 32, 6, 0, Math.PI * 2);
      ctx.fill();
      this.cache.set('vault_blast_door', canvas);
    }

    // 10. The Chronos Oculus Pedestal & Floating Artifact (32x48)
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(32, 48);
      // Futuristic forcefield pedestal
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, 32, 24, 14);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 33, 22, 12);
      // Holographic glowing column
      const grad = ctx.createLinearGradient(0, 10, 0, 32);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
      ctx.fillStyle = grad;
      ctx.fillRect(8, 10, 16, 22);

      // Floating Chronos Oculus Artifact (bobs up and down with rotation frame)
      const bobY = 14 + Math.sin((f / 4) * Math.PI * 2) * 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(16, bobY, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Internal rotating astrolabe spoke
      ctx.save();
      ctx.translate(16, bobY);
      ctx.rotate((f / 4) * Math.PI);
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
      ctx.moveTo(0, -6); ctx.lineTo(0, 6);
      ctx.stroke();
      ctx.restore();
      // Glowing core
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(16, bobY, 3, 0, Math.PI * 2);
      ctx.fill();
      this.cache.set(`artifact_pedestal_${f}`, canvas);
    }
  }

  // --- INVENTORY ITEM ICONS (24x24) ---
  generateItemSprites() {
    const items = [
      { id: 'brass_key', draw: (ctx) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(8, 8, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(8, 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(11, 7, 10, 2);
        ctx.fillRect(17, 9, 2, 4);
        ctx.fillRect(14, 9, 2, 3);
      }},
      { id: 'uv_monocle', draw: (ctx) => {
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(12, 10, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.beginPath(); ctx.arc(12, 10, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(11, 17, 2, 6);
      }},
      { id: 'cipher_notes', draw: (ctx) => {
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(4, 3, 16, 18);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(6, 6, 12, 1);
        ctx.fillRect(6, 9, 10, 1);
        ctx.fillRect(6, 12, 12, 1);
        ctx.fillRect(6, 15, 8, 1);
      }},
      { id: 'relic_emerald', draw: (ctx) => {
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.moveTo(12, 4); ctx.lineTo(19, 12); ctx.lineTo(12, 20); ctx.lineTo(5, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#a7f3d0'; ctx.fillRect(10, 8, 4, 4);
      }},
      { id: 'relic_ruby', draw: (ctx) => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.moveTo(12, 4); ctx.lineTo(19, 12); ctx.lineTo(12, 20); ctx.lineTo(5, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fecaca'; ctx.fillRect(10, 8, 4, 4);
      }},
      { id: 'relic_sapphire', draw: (ctx) => {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.moveTo(12, 4); ctx.lineTo(19, 12); ctx.lineTo(12, 20); ctx.lineTo(5, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#bfdbfe'; ctx.fillRect(10, 8, 4, 4);
      }},
      { id: 'relic_amber', draw: (ctx) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.moveTo(12, 4); ctx.lineTo(19, 12); ctx.lineTo(12, 20); ctx.lineTo(5, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fde68a'; ctx.fillRect(10, 8, 4, 4);
      }},
      { id: 'relic_amethyst', draw: (ctx) => {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath(); ctx.moveTo(12, 4); ctx.lineTo(19, 12); ctx.lineTo(12, 20); ctx.lineTo(5, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f3e8ff'; ctx.fillRect(10, 8, 4, 4);
      }},
      { id: 'prism_key', draw: (ctx) => {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath(); ctx.moveTo(12, 3); ctx.lineTo(20, 18); ctx.lineTo(4, 18); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(11, 8, 2, 6);
      }},
      { id: 'chronos_oculus', draw: (ctx) => {
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(12, 12, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath(); ctx.arc(12, 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(11, 1, 2, 4);
      }}
    ];

    items.forEach((it) => {
      const { canvas, ctx } = this.createCanvas(24, 24);
      it.draw(ctx);
      this.cache.set(`item_${it.id}`, canvas);
    });
  }

  get(key) {
    return this.cache.get(key);
  }
}

export const sprites = new SpriteManager();
