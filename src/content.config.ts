import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema'
import { docsVersionsLoader } from 'starlight-versions/loader'
import { autoSidebarLoader } from 'starlight-auto-sidebar/loader'
import { autoSidebarSchema } from 'starlight-auto-sidebar/schema'

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: (context) => blogSchema(context)
		})
	}),
	// versions:
	// 	defineCollection(
	// 		{
	// 			loader: docsVersionsLoader()
	// 		}
	// 	),
	// autoSidebar: defineCollection({
	// 	loader: autoSidebarLoader(),
	// 	schema: autoSidebarSchema(),
	// }),
};