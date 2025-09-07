interface WebsiteConfig {
  websiteName: string;
  themeColor: string;
  websiteLogo: string;
  websiteDisc: string;
  websiteDomain: string;
  websiteAboutProduct: string;
  websiteAboutUs: string;
  phoneNumber: string;
  promptPayID: string;
  loginAPI: string;
  discordLink: string;
}

const defaultConfig: WebsiteConfig = {
  websiteName: '',
  themeColor: '#000000',
  websiteLogo: '',
  websiteDisc: '',
  websiteDomain: '',
  websiteAboutProduct: '',
  websiteAboutUs: '',
  phoneNumber: '',
  promptPayID: '',
  loginAPI: '',
  discordLink: ''
};

const websiteConfig: WebsiteConfig = { ...defaultConfig };

async function loadConfigFromAPI(): Promise<WebsiteConfig> {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const result = await fetch(`${baseUrl}/api/getconfig`);
    
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json();
    const apiConfig = data as WebsiteConfig;
    
    Object.assign(websiteConfig, apiConfig);
    
    return websiteConfig;
  } catch (error) {
    console.error('Failed to load config from API, using default:', error);
    return websiteConfig;
  }
}

export { loadConfigFromAPI };
export default websiteConfig;
export type { WebsiteConfig };