/**
 * Helper for GitHub Gist API interactions.
 */

const GITHUB_API_URL = 'https://api.github.com';
const GIST_FILENAME = 'custom-script-extension-backup.json';

class GitHubService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    if (!this.token) throw new Error('GitHub Token not set');
    return {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  async findBackupGist() {
    // List user's gists to find one with the specific filename
    const response = await fetch(`${GITHUB_API_URL}/gists`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid Token');
        throw new Error('Failed to fetch Gists');
    }

    const gists = await response.json();
    return gists.find(gist => gist.files && gist.files[GIST_FILENAME]);
  }

  async uploadData(jsonData) {
    const content = JSON.stringify(jsonData, null, 2);
    const existingGist = await this.findBackupGist();

    const files = {};
    files[GIST_FILENAME] = { content: content };

    if (existingGist) {
      // Update existing Gist
      const response = await fetch(`${GITHUB_API_URL}/gists/${existingGist.id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ files: files })
      });
      if (!response.ok) throw new Error('Failed to update Gist');
    } else {
      // Create new Secret Gist
      const response = await fetch(`${GITHUB_API_URL}/gists`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          description: 'Backup for Chrome Custom Script Extension',
          public: false,
          files: files
        })
      });
      if (!response.ok) throw new Error('Failed to create Gist');
    }
  }

  async downloadData() {
    const existingGist = await this.findBackupGist();
    if (!existingGist) throw new Error('No backup found');

    const file = existingGist.files[GIST_FILENAME];
    if (!file || !file.raw_url) throw new Error('Backup file corrupt');

    const response = await fetch(file.raw_url);
    if (!response.ok) throw new Error('Failed to download content');

    return await response.json();
  }
}

// Export singleton
window.githubService = new GitHubService();
