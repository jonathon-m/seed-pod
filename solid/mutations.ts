import { createContainerAt, deleteFile, saveFileInContainer } from "@inrupt/solid-client";
import { setPublicAccess } from "@inrupt/solid-client/universal";
import { fetch, login, logout } from "@inrupt/solid-client-authn-browser";


export async function deleteResource(url: string): Promise<void> {
    await deleteFile(url, { fetch })
}

export async function createFolder(url: string): Promise<void> {
    await createContainerAt(url, { fetch })
}

export async function uploadFile(params: {url: string, file: File}): Promise<void> {
    saveFileInContainer(params.url, params.file, { slug: params.file.name, contentType: params.file.type, fetch })

}

export async function setPublic(params: {url: string, read: boolean}): Promise<void> {
    await setPublicAccess(params.url, { read: params.read }, { fetch })
}

export async function loginToSelectedIdp(idp: string) {
    await login({
        oidcIssuer: idp,
        redirectUrl: new URL("/", window.location.href).toString(),
        clientName: "SeedPod",
      });
}

export async function handleLogout() {
    await logout({logoutType: 'app'})
}
