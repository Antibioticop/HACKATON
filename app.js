const CLAUDE_API_KEY = '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';

let ARTICLES = [];
let currentFilter = null;
let topicChart = null;

// JSON directo (sin fetch externo)
async function loadArticles() {
    try {
        // Datos directos en vez de fetch
        ARTICLES = await fetch('https://raw.githubusercontent.com/antibioticop/HACKATON/main/articulos.json')
            .then(r => r.json());
        
        console.log(`Loaded ${ARTICLES.length} articles`);
        
        analyzeArticles();
        createKnowledgeGraph();
        createTopicChart();
        
    } catch (error) {
        console.error('Error loading articles:', error);
        alert('Error loading articles database. Check console for details.');
    }
}

function analyzeArticles() {
    const topics = {
        microgravity: 0,
        radiation: 0,
        bone: 0,
        cell: 0,
        plant: 0,
        immune: 0
    };
    
    ARTICLES.forEach(article => {
        const title = article.Title.toLowerCase();
        
        if (title.includes('microgravity') || title.includes('gravity')) topics.microgravity++;
        if (title.includes('radiation') || title.includes('ionizing')) topics.radiation++;
        if (title.includes('bone') || title.includes('skeletal')) topics.bone++;
        if (title.includes('cell') || title.includes('cellular')) topics.cell++;
        if (title.includes('plant') || title.includes('arabidopsis')) topics.plant++;
        if (title.includes('immune') || title.includes('immunity')) topics.immune++;
    });
    
    document.getElementById('microgravityCount').textContent = topics.microgravity;
    document.getElementById('radiationCount').textContent = topics.radiation;
    document.getElementById('boneCount').textContent = topics.bone;
    document.getElementById('cellCount').textContent = topics.cell;
}

function createKnowledgeGraph() {
    const width = document.getElementById('knowledgeGraph').offsetWidth;
    const height = 500;
    
    const nodes = [
        { id: 'microgravity', group: 1, size: 30 },
        { id: 'radiation', group: 2, size: 25 },
        { id: 'bone_loss', group: 3, size: 28 },
        { id: 'immune_system', group: 4, size: 22 },
        { id: 'cell_damage', group: 5, size: 26 },
        { id: 'muscle_atrophy', group: 3, size: 20 },
        { id: 'plant_growth', group: 6, size: 18 },
        { id: 'dna_damage', group: 5, size: 24 },
        { id: 'stem_cells', group: 5, size: 21 }
    ];
    
    const links = [
        { source: 'microgravity', target: 'bone_loss', value: 3 },
        { source: 'microgravity', target: 'muscle_atrophy', value: 3 },
        { source: 'microgravity', target: 'immune_system', value: 2 },
        { source: 'microgravity', target: 'stem_cells', value: 2 },
        { source: 'radiation', target: 'dna_damage', value: 3 },
        { source: 'radiation', target: 'cell_damage', value: 3 },
        { source: 'radiation', target: 'bone_loss', value: 2 },
        { source: 'cell_damage', target: 'stem_cells', value: 2 },
        { source: 'microgravity', target: 'plant_growth', value: 2 },
        { source: 'bone_loss', target: 'muscle_atrophy', value: 2 }
    ];
    
    const svg = d3.select('#knowledgeGraph')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', '#00d4ff')
        .attr('stroke-opacity', 0.3)
        .attr('stroke-width', d => d.value);
    
    const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => d.size)
        .attr('fill', d => color(d.group))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    const label = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .text(d => d.id.replace('_', ' '))
        .attr('font-size', 12)
        .attr('fill', '#fff')
        .attr('text-anchor', 'middle')
        .attr('dy', 4);
    
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        label
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

function createTopicChart() {
    const ctx = document.getElementById('topicChart').getContext('2d');
    
    topicChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Microgravity', 'Radiation', 'Bone Loss', 'Immune System', 'Plant Biology', 'Cell Studies'],
            datasets: [{
                label: 'Number of Publications',
                data: [
                    parseInt(document.getElementById('microgravityCount').textContent) || 0,
                    parseInt(document.getElementById('radiationCount').textContent) || 0,
                    parseInt(document.getElementById('boneCount').textContent) || 0,
                    0,
                    0,
                    parseInt(document.getElementById('cellCount').textContent) || 0
                ],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.6)',
                    'rgba(123, 47, 247, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(76, 175, 80, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    '#00d4ff',
                    '#7b2ff7',
                    '#ff9f40',
                    '#4bc0c0',
                    '#4caf50',
                    '#ff6384'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    if (ARTICLES.length === 0) {
        alert('Loading articles... please wait');
        return;
    }
    
    document.getElementById('loading').classList.add('show');
    document.getElementById('results').innerHTML = '';
    document.getElementById('aiInsights').style.display = 'none';
    
    try {
        const relevantArticles = preFilterArticles(query);
        
        if (relevantArticles.length === 0) {
            document.getElementById('loading').classList.remove('show');
            document.getElementById('results').innerHTML = '<div class="card"><h3>No results found</h3><p>Try different keywords</p></div>';
            return;
        }
        
        const analysis = await analyzeWithAI(query, relevantArticles.slice(0, 10));
        
        displayResults(analysis);
        displayAIInsights(analysis);
        
        document.getElementById('analyzedCount').textContent = 
            parseInt(document.getElementById('analyzedCount').textContent) + relevantArticles.length;
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    } finally {
        document.getElementById('loading').classList.remove('show');
    }
}

function preFilterArticles(query) {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/);
    
    const scored = ARTICLES.map(article => {
        let score = 0;
        const titleLower = article.Title.toLowerCase();
        
        keywords.forEach(keyword => {
            if (titleLower.includes(keyword)) score += 10;
        });
        
        return { ...article, score };
    }).filter(a => a.score > 0);
    
    return scored.sort((a, b) => b.score - a.score);
}

async function analyzeWithAI(query, articles) {
    const articlesList = articles.map((a, i) => `${i + 1}. ${a.Title}`).join('\n');
    
    const prompt = `You are a NASA bioscience research analyst. Analyze these space biology publications related to: "${query}"

Publications:
${articlesList}

For each relevant publication, provide:
1. A brief summary of the experiment
2. Key findings and impacts
3. Relevance score (0-100)

Respond with JSON:
{
  "publications": [
    {
      "id": 1,
      "summary": "Brief experiment description",
      "impacts": ["Impact 1", "Impact 2"],
      "relevance": 95
    }
  ],
  "insights": {
    "mainTheme": "Overall theme",
    "keyFindings": ["Finding 1", "Finding 2"],
    "futureImplications": "Implications for space exploration"
  }
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            messages: [{ role: 'user', content: prompt }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
        throw new Error('Invalid AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    analysis.publications = analysis.publications.map(pub => ({
        ...pub,
        article: articles[pub.id - 1]
    }));
    
    return analysis;
}

function displayResults(analysis) {
    const container = document.getElementById('results');
    
    const html = analysis.publications.map(pub => `
        <div class="result-card">
            <div class="result-title">${pub.article.Title}</div>
            <div class="result-meta">
                <span class="badge badge-primary">Relevance: ${pub.relevance}%</span>
                <span class="badge badge-success">Space Biology</span>
            </div>
            <div class="result-summary">${pub.summary}</div>
            <div class="result-impacts">
                <h4>Key Impacts & Findings:</h4>
                <div class="impact-list">
                    ${pub.impacts.map(impact => `• ${impact}`).join('<br>')}
                </div>
            </div>
            <a href="${pub.article.Link}" target="_blank" class="result-link">Read Full Publication →</a>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function displayAIInsights(analysis) {
    const container = document.getElementById('insightsContent');
    
    const html = `
        <div class="insight-item">
            <div class="insight-title">Main Research Theme</div>
            <div class="insight-text">${analysis.insights.mainTheme}</div>
        </div>
        <div class="insight-item">
            <div class="insight-title">Key Findings Across Publications</div>
            <div class="insight-text">
                ${analysis.insights.keyFindings.map(f => `• ${f}`).join('<br>')}
            </div>
        </div>
        <div class="insight-item">
            <div class="insight-title">Future Implications</div>
            <div class="insight-text">${analysis.insights.futureImplications}</div>
        </div>
    `;
    
    container.innerHTML = html;
    document.getElementById('aiInsights').style.display = 'block';
}

function filterByTopic(topic) {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('searchInput').value = topic;
    performSearch();
}

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key ==='Enter') {
            performSearch();
        }
    });

});

