const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 150000; // 2.5 minutes timeout to handle shared hosting latency

  const ftpHost = process.env.FTP_HOST;
  const ftpUser = process.env.FTP_USER;
  const ftpPassword = process.env.FTP_PASSWORD;
  const ftpRemoteDir = process.env.FTP_REMOTE_DIR || "public_html";
  const ftpPort = parseInt(process.env.FTP_PORT || "21", 10);
  const ftpSecure = process.env.FTP_SECURE !== "false"; // Default to secure (FTPS)

  if (!ftpHost || !ftpUser || !ftpPassword) {
    console.error("Error: FTP_HOST, FTP_USER, and FTP_PASSWORD must be configured in your .env.local file.");
    process.exit(1);
  }

  try {
    console.log(`Connecting to ${ftpHost}:${ftpPort}...`);
    await client.access({
      host: ftpHost,
      user: ftpUser,
      password: ftpPassword,
      port: ftpPort,
      secure: ftpSecure,
      secureOptions: {
        rejectUnauthorized: false // Helps avoid SSL certificate validation errors on shared servers
      }
    });

    console.log("Connected successfully to FTP server.");

    const localDir = path.join(__dirname, "out");
    if (!fs.existsSync(localDir)) {
      console.error("Error: Build output folder 'out' not found. Run 'npm run build' first.");
      process.exit(1);
    }

    console.log(`Uploading contents of '${localDir}' to remote folder '${ftpRemoteDir}'...`);
    await client.uploadFromDir(localDir, ftpRemoteDir);
    console.log("Deployment completed successfully!");
  } catch (err) {
    console.error("Deployment failed:", err);
  } finally {
    client.close();
  }
}

deploy();
