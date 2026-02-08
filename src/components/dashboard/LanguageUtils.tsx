
export const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Rust: "#dea584",
  "C#": "#178600",
  "C++": "#f34b7d",
  Other: "#6e7781"
};

export const calculateLanguageData = (repositories: any[] = []) => {
  const langMap: Record<string, number> = {};
  let total = 0;
  
  repositories.forEach(repo => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      total++;
    }
  });
  
  return Object.entries(langMap).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
    color: languageColors[name] || languageColors.Other
  }));
};
