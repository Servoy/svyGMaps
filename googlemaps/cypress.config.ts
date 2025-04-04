import { defineConfig } from "cypress";
import * as path from 'path';

export default defineConfig({
	component: {
		supportFile: "cypress/support/component.ts", // Make sure this path is correct
		devServer: {
			framework: "angular",
			bundler: "webpack",
			webpackConfig: {
				module: {
					rules: [{
						test: /\.css$/,
						include: [
							path.resolve(__dirname, 'projects/googlemaps/svygmaps.css')
						],
						use: ['style-loader', 'css-loader'],
					}],
				},
			},
		},
		specPattern: "**/*.cy.ts",
	},
});