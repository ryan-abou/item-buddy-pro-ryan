import { ArrowLeft, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DocHeader() {
  const navigate = useNavigate();

  const handleDownloadHTML = () => {
    const article = document.querySelector("article");
    if (!article) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IT Equipment Checkout System — Complete Documentation</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.7; }
  h1 { font-size: 1.8em; font-weight: 900; margin-bottom: 0.5em; }
  h2 { font-size: 1.4em; font-weight: 700; margin-top: 2em; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.3em; }
  h3 { font-size: 1.15em; font-weight: 600; margin-top: 1.5em; }
  h4 { font-size: 1em; font-weight: 600; margin-top: 1.2em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #d4d4d4; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  ul, ol { padding-left: 1.5em; }
  li { margin: 0.3em 0; }
  hr { border: none; border-top: 1px solid #e5e5e5; margin: 2em 0; }
  strong { font-weight: 600; }
</style>
</head>
<body>
${article.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "IT-Equipment-Checkout-Documentation.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="border-b bg-card px-6 py-4 print:hidden">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadHTML}>
            <Download className="mr-1 h-4 w-4" />
            Download HTML
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />
            Print / PDF
          </Button>
        </div>
      </div>
    </header>
  );
}
