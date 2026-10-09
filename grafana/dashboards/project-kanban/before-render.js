// Build safe, escaped card markup from the SQL data frame.
context.handlebars.registerHelper('renderKanban', (rows) => {
  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
  const values = Array.isArray(rows) ? rows : [];
  const columns = new Map();

  for (const row of values) {
    const key = String(row.state_id ?? '');
    if (!columns.has(key)) {
      columns.set(key, { name: row.state_name || 'Sem estado', projects: [] });
    }
    if (row.project_id !== null && row.project_id !== undefined) {
      columns.get(key).projects.push(row);
    }
  }

  return [...columns.values()].map((column) => {
    const cards = column.projects.length
      ? column.projects.map((project) => {
          const progress = Math.max(0, Math.min(100, Number(project.percent_done) || 0));
          return `<article class="project-kanban__card">
            <div class="project-kanban__id">#${escapeHtml(project.project_id)}</div>
            <h3 class="project-kanban__name">${escapeHtml(project.project_name)}</h3>
            <div class="project-kanban__meta"><span>Prioridade ${escapeHtml(project.priority)}</span><span>${escapeHtml(project.task_count)} tarefas</span></div>
            <div class="project-kanban__progress-label"><span>Progresso</span><span>${progress.toFixed(0)}%</span></div>
            <div class="project-kanban__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
          </article>`;
        }).join('')
      : '<div class="project-kanban__empty">Nenhum projeto</div>';
    return `<section class="project-kanban__column"><header class="project-kanban__header"><h2 class="project-kanban__title">${escapeHtml(column.name)}</h2><span class="project-kanban__count">${column.projects.length}</span></header><div class="project-kanban__cards">${cards}</div></section>`;
  }).join('');
});
