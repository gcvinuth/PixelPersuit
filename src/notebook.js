// Detective Notebook & Olympiad Logic Scratchpad
import { gameState } from './state.js';
import { sounds } from './audio.js';

export class NotebookManager {
  constructor() {
    this.isOpen = false;
  }

  render(container) {
    const elapsedSeconds = Math.floor((gameState.stats.elapsedTime + (Date.now() - gameState.stats.startTime)) / 1000);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    container.innerHTML = `
      <div class="notebook-modal">
        <div class="notebook-header">
          <div class="notebook-title">
            <span class="icon">📓</span>
            <h2>Spectre's Field Journal & Logic Scratchpad</h2>
          </div>
          <button id="btn-close-notebook" class="btn-close-modal">✕ Close [N]</button>
        </div>

        <div class="notebook-tabs">
          <button class="notebook-tab active" data-tab="clues">Case Log & Clues (${gameState.clues.length})</button>
          <button class="notebook-tab" data-tab="scratchpad">Logic Scratchpad</button>
          <button class="notebook-tab" data-tab="reference">Olympiad Reference</button>
        </div>

        <div class="notebook-body">
          <!-- TAB 1: CLUES -->
          <div class="tab-pane active" id="pane-clues">
            ${gameState.clues.length === 0 ? `
              <div class="empty-clues">
                <p>No clues recorded yet. Explore the mansion, inspect bookshelves, examine paintings, and converse with mechanisms to record forensic data.</p>
              </div>
            ` : `
              <div class="clues-list">
                ${gameState.clues.map((c, i) => `
                  <div class="clue-entry">
                    <div class="clue-meta">
                      <span class="clue-idx">#${i + 1}</span>
                      <span class="clue-time">${c.timestamp || ''}</span>
                    </div>
                    <div class="clue-content">${c.text}</div>
                  </div>
                `).reverse().join('')}
              </div>
            `}
          </div>

          <!-- TAB 2: LOGIC SCRATCHPAD -->
          <div class="tab-pane" id="pane-scratchpad">
            <div class="scratchpad-section">
              <h3>Interactive Truth Table (Knights & Knaves Scratchpad)</h3>
              <p class="scratch-help">Toggle values to test hypotheticals without affecting the active puzzle lock:</p>
              
              <table class="scratch-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Hypothesis</th>
                    <th>Implication / Contradiction Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Lord Butler</td>
                    <td>
                      <select class="scratch-select" data-who="butler">
                        <option value="">-- ? --</option>
                        <option value="T" ${gameState.notebookScratchpad.suspects.butler === 'T' ? 'selected' : ''}>Truth (T)</option>
                        <option value="F" ${gameState.notebookScratchpad.suspects.butler === 'F' ? 'selected' : ''}>Liar (F)</option>
                      </select>
                    </td>
                    <td>Claims Guard is Liar. If True => Guard=F.</td>
                  </tr>
                  <tr>
                    <td>Master Scribe</td>
                    <td>
                      <select class="scratch-select" data-who="scribe">
                        <option value="">-- ? --</option>
                        <option value="T" ${gameState.notebookScratchpad.suspects.scribe === 'T' ? 'selected' : ''}>Truth (T)</option>
                        <option value="F" ${gameState.notebookScratchpad.suspects.scribe === 'F' ? 'selected' : ''}>Liar (F)</option>
                      </select>
                    </td>
                    <td>Claims Butler & Chemist are equivalent (B == C).</td>
                  </tr>
                  <tr>
                    <td>Court Chemist</td>
                    <td>
                      <select class="scratch-select" data-who="chemist">
                        <option value="">-- ? --</option>
                        <option value="T" ${gameState.notebookScratchpad.suspects.chemist === 'T' ? 'selected' : ''}>Truth (T)</option>
                        <option value="F" ${gameState.notebookScratchpad.suspects.chemist === 'F' ? 'selected' : ''}>Liar (F)</option>
                      </select>
                    </td>
                    <td>Claims B => (not S). If B is False, this statement is vacuously True!</td>
                  </tr>
                  <tr>
                    <td>Chief Guard</td>
                    <td>
                      <select class="scratch-select" data-who="guard">
                        <option value="">-- ? --</option>
                        <option value="T" ${gameState.notebookScratchpad.suspects.guard === 'T' ? 'selected' : ''}>Truth (T)</option>
                        <option value="F" ${gameState.notebookScratchpad.suspects.guard === 'F' ? 'selected' : ''}>Liar (F)</option>
                      </select>
                    </td>
                    <td>Claims at least one of Scribe or Chemist lies (not S or not C).</td>
                  </tr>
                </tbody>
              </table>

              <div class="custom-notes-wrap">
                <h4>Freeform Tactical Notes:</h4>
                <textarea id="scratch-custom-text" placeholder="Jot down equations, combinations, or beam angles...">${gameState.notebookScratchpad.notes || ''}</textarea>
              </div>
            </div>
          </div>

          <!-- TAB 3: OLYMPIAD REFERENCE -->
          <div class="tab-pane" id="pane-reference">
            <div class="reference-cards">
              <div class="ref-card">
                <h4>Euler's Planar Formula</h4>
                <p>For any connected planar graph: <code>V - E + F = 2</code></p>
                <small>Where V = Vertices, E = Edges, F = Faces (including the unbounded outer face).</small>
              </div>
              <div class="ref-card">
                <h4>Chinese Remainder Theorem</h4>
                <p>If moduli <code>m₁, m₂, ... mₖ</code> are pairwise coprime, there exists a unique solution modulo their product <code>M = ∏ mᵢ</code>.</p>
                <small>For moduli 3, 5, 7: M = 3 × 5 × 7 = 105.</small>
              </div>
              <div class="ref-card">
                <h4>Hamiltonian Paths</h4>
                <p>A path in an undirected or directed graph that visits each vertex exactly once without repeating vertices.</p>
              </div>
              <div class="ref-card">
                <h4>Law of Reflection</h4>
                <p>The angle of incidence equals the angle of reflection: <code>θᵢ = θᵣ</code>. A 45° planar mirror rotates a beam vector by exactly 90°.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="notebook-footer">
          <div class="heist-timer">⏱ Heist Duration: <strong>${timeFormatted}</strong></div>
          <div class="heist-hints">💡 Hints Consulted: <strong>${gameState.stats.hintsUsed}</strong></div>
        </div>
      </div>
    `;

    // Tab switching
    container.querySelectorAll('.notebook-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        sounds.playBlip();
        container.querySelectorAll('.notebook-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPane = container.querySelector(`#pane-${tab.dataset.tab}`);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Notes auto-save
    const textarea = container.querySelector('#scratch-custom-text');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        gameState.notebookScratchpad.notes = e.target.value;
        gameState.save();
      });
    }

    // Select change
    container.querySelectorAll('.scratch-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const who = sel.dataset.who;
        gameState.notebookScratchpad.suspects[who] = e.target.value || null;
        gameState.save();
      });
    });

    // Close button
    container.querySelector('#btn-close-notebook').addEventListener('click', () => {
      sounds.playBlip();
      this.close();
    });
  }

  open(container) {
    this.isOpen = true;
    container.classList.remove('hidden');
    this.render(container);
  }

  close() {
    this.isOpen = false;
    const el = document.getElementById('notebook-overlay');
    if (el) el.classList.add('hidden');
  }

  toggle(container) {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(container);
    }
  }
}

export const notebook = new NotebookManager();
