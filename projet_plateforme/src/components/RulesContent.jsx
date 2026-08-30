export default function RulesContent() {
  return (
    <div className="rules-content">
      <section className="rules-section">
        <h2>📹 Durée, formats et qualité</h2>
        <ul>
          <li><strong>Durée</strong> : jusqu'à 45 minutes maximum. Pas de durée minimale imposée.</li>
          <li><strong>Formats acceptés</strong> : MP4 ou MOV — vidéo encodée en H.264, avec une piste audio AAC.</li>
          <li><strong>Taille</strong> : 2 Go maximum.</li>
          <li><strong>Qualité minimale</strong> : résolution vidéo d'au moins 1280×720 (720p).</li>
          <li><strong>Son</strong> : la vidéo doit contenir une piste audio exploitable — les vidéos totalement muettes sont refusées.</li>
        </ul>
      </section>

      <section className="rules-section">
        <h2>💬 Sous-titres</h2>
        <ul>
          <li>Des <strong>sous-titres en français (VF)</strong> sont <strong>obligatoires</strong> sur toute vidéo déposée.</li>
          <li>Des sous-titres en <strong>version originale (VO)</strong> sont les bienvenus en bonus, notamment si les dialogues ne sont pas en français.</li>
          <li>En attendant un import dédié, incrustez les sous-titres directement dans l'image (hardsub) lors de l'export de votre vidéo.</li>
        </ul>
      </section>

      <section className="rules-section">
        <h2>🚫 Contenus refusés</h2>
        <ul>
          <li>Violence explicite ou complaisante (gore, mise en scène réaliste de meurtre ou de sévices).</li>
          <li>Contenu à caractère pornographique ou sexuel explicite.</li>
          <li>Harcèlement ou attaque ciblée envers une personne.</li>
          <li>Propos discriminatoires (racisme, sexisme, homophobie, etc.) ou incitation à la haine.</li>
          <li>Toute autre incitation à la violence ou promotion d'une activité illégale.</li>
        </ul>
        <p className="rules-note">
          Chaque dépôt passe par une vérification automatique puis par la validation d'un modérateur avant d'être publié.
          Le non-respect de ces règles peut entraîner le rejet de la vidéo ou la suspension du compte.
        </p>
      </section>
    </div>
  )
}
