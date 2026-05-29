async function loadEmbed() {
  const response = await fetch('/embed/items/1');
  if (!response.ok) {
    console.error('Failed to load embed token:', response.status);
    return;
  }
  const { embedToken, embedUrl } = await response.json();

  // Submit the embed token form from the parent page, targeting the iframe by name.
  // Using iframe.srcdoc would give the form a null origin, which Domo rejects on
  // first load (no existing Domo session). Posting from the parent page sends
  // Origin: http://localhost:3001, which Domo accepts.
  const form = document.createElement('form');
  form.method = 'post';
  form.action = embedUrl;
  form.target = 'domoEmbed';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'embedToken';
  input.value = embedToken;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

loadEmbed();
