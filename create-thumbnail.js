const fs = require("fs");
const path = require("path");

// Create a simple thumbnail using Canvas (if available) or generate programmatically
function createThumbnail() {
  // Since we don't have canvas in Node.js by default, we'll create a simple HTML file
  // that can generate the thumbnail
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Thumbnail Generator</title>
</head>
<body>
    <canvas id="thumbnail" width="475" height="220" style="border: 1px solid #ccc;"></canvas>
    <br>
    <button onclick="downloadThumbnail()">Download Thumbnail</button>
    
    <script>
        const canvas = document.getElementById('thumbnail');
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 475, 220);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 475, 220);
        
        // Add game title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦑 SQUID GAME', 237.5, 80);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Mini App', 237.5, 120);
        
        // Add character info
        ctx.font = '18px Arial';
        ctx.fillText('👩 Yeonghee Game', 237.5, 160);
        
        // Add decorative elements
        ctx.fillStyle = '#FFD93D';
        ctx.font = '20px Arial';
        ctx.fillText('🎮 Play Now!', 237.5, 190);
        
        function downloadThumbnail() {
            const link = document.createElement('a');
            link.download = 'thumbnail.png';
            link.href = canvas.toDataURL();
            link.click();
        }
        
        // Auto download after 1 second
        setTimeout(() => {
            console.log('Thumbnail created! Click download button to save.');
        }, 1000);
    </script>
</body>
</html>`;

  // Save HTML file
  fs.writeFileSync(
    path.join(__dirname, "thumbnail-generator.html"),
    htmlContent
  );
  console.log(
    "📝 Open this file in browser to generate and download thumbnail.png"
  );
}

createThumbnail();
