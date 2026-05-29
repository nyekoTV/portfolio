const GITHUB_USERNAME = "nyekoTV";

const MAX_PROJECTS = 100;

const SHOW_FORKS = true;

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  revealElements.forEach((element) => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const revealPoint = 120;

    if (elementTop < windowHeight - revealPoint) {
      element.classList.add("active");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

const projectsGrid = document.querySelector("#projects-grid");
const projectsStatus = document.querySelector("#projects-status");

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
};

const cleanRepoName = (name) => {
  return name
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const createTag = (text) => {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
};

const createProjectCard = (repo) => {
  const article = document.createElement("article");
  article.className = "project-card reveal active";

  const content = document.createElement("div");

  const header = document.createElement("div");
  header.className = "project-header";

  const title = document.createElement("h3");
  title.className = "project-name";
  title.textContent = cleanRepoName(repo.name);

  const publicBadge = document.createElement("span");
  publicBadge.className = "project-public";
  publicBadge.textContent = "Public";

  header.appendChild(title);
  header.appendChild(publicBadge);

  const description = document.createElement("p");
  description.textContent =
    repo.description || "Dépôt public disponible sur mon GitHub.";

  const tags = document.createElement("div");
  tags.className = "tags";

  if (repo.language) {
    tags.appendChild(createTag(repo.language));
  }

  if (repo.topics && repo.topics.length > 0) {
    repo.topics.slice(0, 3).forEach((topic) => {
      tags.appendChild(createTag(topic));
    });
  }

  if (!repo.language && (!repo.topics || repo.topics.length === 0)) {
    tags.appendChild(createTag("GitHub"));
  }

  const meta = document.createElement("p");
  meta.className = "project-meta";
  meta.textContent = `Mis à jour le ${formatDate(repo.updated_at)}`;

  content.appendChild(header);
  content.appendChild(description);
  content.appendChild(tags);
  content.appendChild(meta);

  const githubButton = document.createElement("a");
  githubButton.href = repo.html_url;
  githubButton.target = "_blank";
  githubButton.rel = "noopener";
  githubButton.className = "btn small";
  githubButton.textContent = "Voir sur GitHub";

  article.appendChild(content);
  article.appendChild(githubButton);

  return article;
};

const loadGithubProjects = async () => {
  try {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=100&type=public`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Impossible de charger les projets GitHub.");
    }

    const repos = await response.json();

    const publicRepos = repos
      .filter((repo) => repo.private === false)
      .filter((repo) => repo.visibility === "public" || repo.visibility === undefined)
      .filter((repo) => SHOW_FORKS || repo.fork === false)
      .filter((repo) => repo.archived === false)
      .slice(0, MAX_PROJECTS);

    projectsGrid.innerHTML = "";

    if (publicRepos.length === 0) {
      projectsStatus.textContent = "Aucun dépôt public trouvé pour le moment.";
      return;
    }

    publicRepos.forEach((repo) => {
      projectsGrid.appendChild(createProjectCard(repo));
    });

    projectsStatus.classList.add("hidden");
  } catch (error) {
    projectsStatus.textContent =
      "Les projets GitHub n'ont pas pu être chargés. Vérifie ta connexion ou ton nom d'utilisateur GitHub.";
    console.error(error);
  }
};

loadGithubProjects();
