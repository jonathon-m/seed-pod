import {
    getPodUrlAll,
    getSolidDataset,
    getContainedResourceUrlAll,
    getFile,
  } from "@inrupt/solid-client";
import { getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";
import { getPublicAccess } from "@inrupt/solid-client/universal";


export async function getWebId(): Promise<string> {
    const session = getDefaultSession()
    if (session.info.isLoggedIn && session.info.webId) {
        return session.info.webId
    } else {
        return ""
    }
}

export async function getPods(webId: string): Promise<Array<string>> {
    return getPodUrlAll(webId, { fetch });
}

export async function getContents(url: string): Promise<Array<string>> {
    let dataset = await getSolidDataset(url, { fetch });
    let containedUrls = await getContainedResourceUrlAll(dataset)
    let contents = []
    for (const subUrl of containedUrls) {
        contents.push(subUrl)
    }
    return contents
}

export async function getFileContents(url: string): Promise<string> {
    const fileBlob = await getFile(url, { fetch })
    return fileBlob.text()
}

export async function isPublicAccess(url: string): Promise<boolean> {
    const access = await getPublicAccess(url, { fetch })
    return !!access?.read
}


