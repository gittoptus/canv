import { notFound, redirect } from "next/navigation";
import type { User } from "next-auth";

import { authOptions, getCurrentUser } from "@canvydocs/auth";
import { db } from "@canvydocs/db";

import { BoardEditor } from "~/components/k8s/board-editor";
import type { Cluster } from "~/types/k8s";

async function getClusterForUser(clusterId: Cluster["id"], userId: User["id"]) {
  return await db
    .selectFrom("K8sClusterConfig")
    .selectAll()
    .where("id", "=", Number(clusterId))
    .where("authUserId", "=", userId)
    .executeTakeFirst();
}

interface EditorClusterProps {
  params: {
    clusterId: number;
    lang: string;
  };
}

export default async function EditorClusterPage({
  params,
}: EditorClusterProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }

  // console.log("EditorClusterPage user:" + user.id + "params:", params);
  const cluster = await getClusterForUser(params.clusterId, user.id);

  if (!cluster) {
    notFound();
  }
  return (
    <BoardEditor
      cluster={{
        id: cluster.id,
        name: cluster.name,
        location: cluster.location,
        content: cluster.content,
      }}
      params={{ lang: params.lang }}
    />
  );
}
