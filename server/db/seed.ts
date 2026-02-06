import Database from 'better-sqlite3'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'data', 'app.db')
const db = new Database(dbPath)

const projects = [
  {
    slug: 'autohive-dashboard',
    title: 'Autohive Dashboard',
    description: 'AI-powered analytics dashboard for automotive dealerships. Built during my internship at Autohive.',
    content: `## Overview

Built a comprehensive analytics dashboard that helps automotive dealerships track sales, inventory, and customer engagement metrics in real-time.

## Key Features

- Real-time data visualization with interactive charts
- AI-powered insights and recommendations
- Custom report generation
- Role-based access control

## Technical Details

The frontend was built with Vue 3 and TypeScript, with a Python backend handling the AI/ML components.`,
    github_url: null,
    live_url: 'https://autohive.com',
    featured_order: 1,
    tags: JSON.stringify(['Vue', 'TypeScript', 'Python', 'AI/ML']),
  },
  {
    slug: 'code-review-assistant',
    title: 'Code Review Assistant',
    description: 'An AI tool that provides intelligent code review suggestions, built to streamline development workflows.',
    content: `## Overview

A developer tool that uses LLMs to provide contextual code review feedback, catching bugs and suggesting improvements before human review.

## Features

- GitHub integration via webhooks
- Contextual suggestions based on project patterns
- Security vulnerability detection
- Performance optimization hints

## Stack

Built with Node.js, integrating with OpenAI's API for intelligent analysis.`,
    github_url: 'https://github.com/alexanderheffernan/code-review-assistant',
    live_url: null,
    featured_order: 2,
    tags: JSON.stringify(['Node.js', 'OpenAI', 'GitHub API', 'TypeScript']),
  },
  {
    slug: 'personal-portfolio',
    title: 'Personal Portfolio',
    description: 'This website! A Nuxt 4 SSR app with SQLite-backed content management.',
    content: `## Overview

My personal portfolio website, built with a focus on performance and maintainability.

## Features

- Server-side rendering with Nuxt 4
- SQLite database for content management
- Custom admin CMS (coming soon)
- Dark mode support

## Why I Built It This Way

I wanted full control over my content without relying on external CMS platforms, while keeping the stack simple and deployment-friendly.`,
    github_url: 'https://github.com/alexanderheffernan/personal-website',
    live_url: 'https://alexanderheffernan.com',
    featured_order: 3,
    tags: JSON.stringify(['Nuxt', 'Vue', 'TypeScript', 'SQLite']),
  },
]

const images = [
  { slug: 'autohive-dashboard', url: '/images/projects/autohive-1.jpg', alt_text: 'Autohive dashboard overview', sort_order: 0 },
  { slug: 'autohive-dashboard', url: '/images/projects/autohive-2.jpg', alt_text: 'Analytics charts', sort_order: 1 },
  { slug: 'code-review-assistant', url: '/images/projects/code-review-1.jpg', alt_text: 'Code review interface', sort_order: 0 },
  { slug: 'personal-portfolio', url: '/images/projects/portfolio-1.jpg', alt_text: 'Portfolio homepage', sort_order: 0 },
]

db.exec('DELETE FROM project_images')
db.exec('DELETE FROM projects')

const insertProject = db.prepare(`
  INSERT INTO projects (slug, title, description, content, github_url, live_url, featured_order, tags)
  VALUES (@slug, @title, @description, @content, @github_url, @live_url, @featured_order, @tags)
`)

const insertImage = db.prepare(`
  INSERT INTO project_images (project_id, url, alt_text, sort_order)
  VALUES (@project_id, @url, @alt_text, @sort_order)
`)

const getProjectId = db.prepare('SELECT id FROM projects WHERE slug = ?')

for (const project of projects) {
  insertProject.run(project)
  console.log(`Inserted project: ${project.title}`)
}

for (const image of images) {
  const project = getProjectId.get(image.slug) as { id: number } | undefined
  if (project) {
    insertImage.run({
      project_id: project.id,
      url: image.url,
      alt_text: image.alt_text,
      sort_order: image.sort_order,
    })
    console.log(`Inserted image for: ${image.slug}`)
  }
}

console.log('Seed complete!')
