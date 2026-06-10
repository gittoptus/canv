"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { Button } from "@canvydocs/ui/button";
import { Input } from "@canvydocs/ui/input";
import * as Icons from "@canvydocs/ui/icons";
import { toast } from "@canvydocs/ui/use-toast";
import { trpc } from "~/trpc/client";

// Dynamically import Excalidraw component with SSR disabled
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-500">
        <Icons.Spinner className="mr-2 h-8 w-8 animate-spin" />
        Carregando Canvas...
      </div>
    ),
  }
);

interface BoardEditorProps {
  cluster: {
    id: number;
    name: string;
    location: string;
    content?: string | null;
  };
  params: {
    lang: string;
  };
}

export function BoardEditor({ cluster, params: { lang } }: BoardEditorProps) {
  const router = useRouter();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [name, setName] = useState<string>(cluster.name);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load initial content when Excalidraw API is ready
  useEffect(() => {
    if (excalidrawAPI && cluster.content) {
      try {
        const parsedElements = JSON.parse(cluster.content);
        if (Array.isArray(parsedElements)) {
          excalidrawAPI.updateScene({
            elements: parsedElements,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar elementos salvos:", error);
      }
    }
  }, [excalidrawAPI, cluster.content]);

  async function handleSave() {
    if (!excalidrawAPI) return;

    setIsSaving(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const contentString = JSON.stringify(elements);

      const response = await trpc.k8s.updateCluster.mutate({
        id: cluster.id,
        name: name,
        location: cluster.location,
        content: contentString,
      });

      if (response?.success) {
        toast({
          description: "Seu quadro foi salvo com sucesso!",
        });
        router.refresh();
      } else {
        toast({
          title: "Erro ao salvar.",
          description: "Não foi possível salvar o seu quadro.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar.",
        description: "Ocorreu um erro interno ao salvar o quadro.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      {/* Top Header Bar */}
      <header className="flex h-14 items-center justify-between border-b px-4 bg-gray-50/50">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${lang}/dashboard`)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Icons.ChevronLeft className="mr-1.5 h-4 w-4" />
            Painel
          </Button>
          <div className="h-4 w-px bg-gray-300" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-60 border-none bg-transparent px-1 font-semibold text-gray-900 focus-visible:ring-1 focus-visible:ring-zinc-300 focus-visible:bg-white"
            placeholder="Nome do quadro"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-sm"
          >
            {isSaving ? (
              <Icons.Spinner className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Icons.Save className="mr-1.5 h-4 w-4" />
            )}
            Salvar
          </Button>
        </div>
      </header>

      {/* Excalidraw Canvas Area */}
      <div className="flex-1 w-full relative">
        <Excalidraw
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          UIOptions={{
            canvasActions: {
              toggleTheme: true,
            },
          }}
        />
      </div>
    </div>
  );
}
