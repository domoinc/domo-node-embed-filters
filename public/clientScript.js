function getGeneratedPageURL(embedToken, embedUrl) {
  return `<html>
  <body>
    <form id="form" action="${embedUrl}" method="post">
      <input type="hidden" name="embedToken" value="${embedToken}">
    </form>
    <script>document.getElementById("form").submit();</script>
  </body>
</html>`;
}

async function loadEmbed() {
  const response = await fetch('/embed/items/1');
  if (!response.ok) {
    console.error('Failed to load embed token:', response.status);
    return;
  }
  const { embedToken, embedUrl } = await response.json();
  document.getElementById('iframe').srcdoc = getGeneratedPageURL(embedToken, embedUrl);
}

loadEmbed();
