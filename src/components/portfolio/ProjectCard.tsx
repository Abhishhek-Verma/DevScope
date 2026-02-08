
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  index: number;
}

export function ProjectCard({ 
  title, 
  description, 
  image, 
  technologies, 
  repoUrl, 
  demoUrl,
  index
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="transition-all duration-300"
    >
      <Card className="overflow-hidden h-full flex flex-col border-t-4 border-t-primary hover:shadow-lg transition-shadow">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2 mt-2">
            {technologies.map((tech) => (
              <Badge 
                key={tech} 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 pt-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(repoUrl, '_blank')}>
            <Github className="h-4 w-4" />
            <span>Repository</span>
          </Button>
          {demoUrl && (
            <Button size="sm" className="gap-1" onClick={() => window.open(demoUrl, '_blank')}>
              <ExternalLink className="h-4 w-4" />
              <span>Live Demo</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
