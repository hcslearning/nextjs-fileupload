import Head from 'next/head'
import { NextPage } from 'next'
import { FileUpload } from '../component/fileupload'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Fileupload Component</title>
        <meta name="description" content="Fileupload on NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Fileupload</h1>

        <FileUpload name="file" />
      </main>

    </div>
  )
}

export default Home
