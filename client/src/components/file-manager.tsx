import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Folder, File, FileText, Upload, Download, Trash2, Edit, Search } from "lucide-react";

interface FileManagerProps {
  serverId: number;
}

interface FileItem {
  name: string;
  type: "folder" | "file";
  size?: string;
  modified: string;
}

export default function FileManager({ serverId }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState(["Root"]);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock file structure
  const files: FileItem[] = [
    { name: "configs", type: "folder", modified: "2024-01-15" },
    { name: "server.properties", type: "file", size: "2.1 KB", modified: "2024-01-15" },
    { name: "bukkit.yml", type: "file", size: "1.8 KB", modified: "2024-01-14" },
    { name: "worlds", type: "folder", modified: "2024-01-13" },
    { name: "plugins", type: "folder", modified: "2024-01-12" },
    { name: "logs", type: "folder", modified: "2024-01-15" },
    { name: "whitelist.json", type: "file", size: "156 B", modified: "2024-01-10" },
    { name: "ops.json", type: "file", size: "89 B", modified: "2024-01-10" },
  ];

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigate = (folderName: string) => {
    if (folderName === "folder") {
      // Mock navigation - in real app, this would make an API call
      setCurrentPath(prev => [...prev, "plugins"]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === "folder") {
      return <Folder className="text-blue-400 h-5 w-5" />;
    }
    
    const extension = item.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt':
      case 'log':
      case 'yml':
      case 'yaml':
      case 'json':
      case 'properties':
        return <FileText className="text-green-400 h-5 w-5" />;
      default:
        return <File className="text-slate-400 h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              {currentPath.map((path, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink
                    onClick={() => handleBreadcrumbClick(index)}
                    className="cursor-pointer text-slate-400 hover:text-white"
                  >
                    {path}
                  </BreadcrumbLink>
                  {index < currentPath.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white w-64"
            />
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* File List */}
      <div className="bg-slate-900 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-400">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-3">Modified</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        <div className="divide-y divide-slate-700">
          {filteredFiles.map((file, index) => (
            <div
              key={index}
              className="p-4 hover:bg-slate-800 cursor-pointer transition-colors grid grid-cols-12 gap-4 items-center"
              onClick={() => file.type === "folder" && handleNavigate(file.name)}
            >
              <div className="col-span-6 flex items-center space-x-3">
                {getFileIcon(file)}
                <span className="text-white">{file.name}</span>
              </div>
              <div className="col-span-2 text-slate-400 text-sm">
                {file.size || (file.type === "folder" ? "Folder" : "-")}
              </div>
              <div className="col-span-3 text-slate-400 text-sm">{file.modified}</div>
              <div className="col-span-1 flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
