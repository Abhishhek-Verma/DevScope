
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key')
    }

    const { githubData, userData } = await req.json()
    
    if (!githubData || !userData) {
      return new Response(
        JSON.stringify({ error: 'Missing required GitHub data' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log("Generating summary for user:", userData.login)
    
    // Format the GitHub data into a structured prompt
    const repositories = githubData.repositories || []
    const contributions = githubData.contributions || []
    
    // Calculate stats
    const totalCommits = contributions.reduce((sum, item) => sum + (item.commits || 0), 0)
    const totalRepos = repositories.length
    
    // Get top languages
    const languages = new Set()
    repositories.forEach(repo => {
      if (repo.language) languages.add(repo.language)
    })
    
    // Get top repositories by stars
    const topRepos = [...repositories]
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 3)
      .map(repo => repo.name)
    
    // Create a prompt for OpenAI
    const prompt = `
    Generate a LinkedIn-style professional summary for a software developer based on their GitHub activity.
    
    GitHub data:
    - Username: ${userData.login || 'Not provided'}
    - Name: ${userData.name || 'Not provided'}
    - Total commits: ${totalCommits}
    - Repositories: ${totalRepos}
    - Top languages: ${Array.from(languages).join(', ')}
    - Notable projects: ${topRepos.join(', ')}
    - Bio: ${userData.bio || 'Not provided'}
    
    Write a concise, professional paragraph that highlights their coding activity, skills, and technical focus areas based on this GitHub data. Make it sound natural and professional, like it could be used on a developer portfolio or LinkedIn profile. Don't mention specific numbers unless they're particularly impressive.
    `

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional resume writer for software developers.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      throw new Error('Failed to generate summary with OpenAI')
    }

    const data = await response.json()
    const summary = data.choices[0].message.content.trim()

    console.log("Successfully generated summary")
    
    return new Response(
      JSON.stringify({ summary }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error("Error in generate-summary function:", error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
