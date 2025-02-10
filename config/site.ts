export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "@fawredd Marcos Moore (BBA)(Developer) portfolio",
	description:`Full Stack Web Developer & Business Administrator. Highly motivated Full Stack Web Developer with extensive experience in international trade comex and business administration. Skilled in JavaScript, React, Next.js, Node.js and more. Passionate about building effective web solutions and contributing to company growth.`,
	navItems: [
		/* {
			label: "Home",
			href: "/",
		}, */
	],
	navMenuItems: [
		/* {
			label: "Home",
			href: "/",
		}, */
	],
	links: {
		github: "https://github.com/fawredd/",
		linkedin: "https://www.linkedin.com/in/mooremarcos",
		twitter: "https://twitter.com/fawredd",
	},
	myHero: {
		title:`I'm Marcos`,
		subtitle:"Full stack developer",
		address:"Based on Buenos Aires, Argentina."
	},
	localRepos:[
		{ 
		uuid: crypto.randomUUID(),
		project_title: "Etercell.com",
		project_description: "Sitio web sobre wordpress empleando plantilla de Plethora Themes.",
		project_image: '/img/etercell-screenshot.jpg',
		project_languages: [{id:crypto.randomUUID(),language:'Other'}],
		project_url: "",
		project_homepage: "https://www.etercell.com",
		project_topics: ["PHP","WORDPRESS", "UI/UX", "Terapias regenerativas", "Productos autologos", "Biomedicina"]
		},
	],
	aiBotMessages: [
		{id:"0A",text:"Hi there!",owner:"bot"},
		{id:"1A",text:"I'm Marcos assistant! Curious about his backgroud?",owner:"bot"},
		{id:"2A",text:"Ask me away!",owner:"bot"},
	]
};
