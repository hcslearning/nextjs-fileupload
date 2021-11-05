import { useRouter } from "next/dist/client/router"
import React, { useEffect, useState } from "react"

export interface CloudinaryResponse {
    asset_id: string
    public_id: string 
    version: number 
    version_id: string 
    signature: string 
    width: number 
    height: number 
    format: string 
    resource_type: string 
    create_at: Date 
    tags: string[] 
    bytes: number 
    type: string 
    etag: string 
    placeholder: boolean 
    url: string 
    secure_url: string 
    access_mode: string 
    existing: boolean 
    original_filename: string 
}

export interface FileUploadProps {
    name: string 
}

export function FileUpload(props:FileUploadProps) {
    const [thumbnailSrc, setThumbnailSrc]           = useState('')
    const [imgSrc, setImgSrc]                       = useState('')
    const [publicId, setPublicId]                   = useState('')
    const [uploadProgress, setUploadProgress]       = useState(0)
    const [cloudinaryPreset, setCloudinaryPreset]   = useState('')
    const [cloudinaryName, setCloudinaryName]       = useState('')
    const router = useRouter()

    useEffect( () => {
        const urlParamsStr  = router.asPath.slice(1) // quita el slash inicial 
        const urlParamsObj  = new URLSearchParams( urlParamsStr )
        const cloudName     = urlParamsObj.get("name") ?? ''
        const preset        = urlParamsObj.get("preset") ?? ''
        setCloudinaryName( cloudName )
        setCloudinaryPreset( preset )
    }, [])

    const handleFileOnchange = (e: React.FormEvent<HTMLInputElement>) => {
        if( e?.currentTarget?.files?.length && e?.currentTarget?.files?.length > 0 ) {
            const file = e?.currentTarget?.files[0]             
            setThumbnailSrc( URL.createObjectURL(file) )
            xhrFileupload(
                file, 
                cloudinaryPreset, 
                cloudinaryName, 
                (p:number) => setUploadProgress(p),
                (url, publicId) => {setImgSrc(url); setPublicId(publicId), setThumbnailSrc('')}
            )
        }
    }

    const handlePresentOnchange = (e:React.FormEvent<HTMLInputElement>) => {
        setCloudinaryPreset(e.currentTarget.value)
    }

    const handleCloudNameOnchange = (e:React.FormEvent<HTMLInputElement>) => {
        setCloudinaryName(e.currentTarget.value)
    }

    return (
        <>
            Cloudinary Name: 
            <input type="text" value={cloudinaryName} onChange={handleCloudNameOnchange} />
            <br /><br />

            Cloudinary Preset:
            <input type="text" value={cloudinaryPreset} onChange={handlePresentOnchange} />
            <br /><br />

            <input type="file" name={props.name} onChange={handleFileOnchange} />            
            {
                uploadProgress != 0 &&   
                <><span>{uploadProgress}%</span><br /><br /></>
            }

            {
                thumbnailSrc != '' &&   
                <><br /><br /><img src={thumbnailSrc} alt="preview upload image" height="60" /></>
            }

            {
                imgSrc != '' &&   
                <><br /><br /><h2>{publicId}</h2><img src={imgSrc} alt="image" /></>
            }            
        </>
    )
}

export function xhrFileupload(
                    file:File, 
                    cloudinaryPreset:string, 
                    cloudinaryName:string,  
                    fnUpdateProgress: (p:number) => void, 
                    fnSetImage: (url:string, public_id:string) => void 
) {
    const reader = new FileReader()
    const xhr = new XMLHttpRequest() 
    
    xhr.upload.addEventListener('progress', function(e:ProgressEvent){
        if( e.lengthComputable ) {
            const percentage = Math.round( (e.loaded * 100)/ e.total )
            fnUpdateProgress(percentage)
        }
    })

    xhr.upload.addEventListener('load', (e:ProgressEvent) => {
        fnUpdateProgress(100)        
    })

    xhr.addEventListener('load', (e:ProgressEvent<EventTarget>) => {
        if( xhr.readyState == 4 && xhr.status == 200 ) {
            const responseJSON:CloudinaryResponse = JSON.parse( xhr.responseText ) as CloudinaryResponse
            console.dir( responseJSON )
            fnSetImage( responseJSON.secure_url, responseJSON.public_id )
        } else {
            console.error("Ocurrió un error al subir la imagen a Cloudinary.")
        }
    })

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`
    const formData = new FormData() 
    formData.append('upload_preset', cloudinaryPreset)
    formData.append('file', file)

    // Important: NOT set headers
    xhr.open('POST', uploadUrl, true)
    xhr.send( formData )
}