define([
	"dojo/_base/declare", "./TabViewerBase", "dojo/on", "dojo/topic",
	"dojo/dom-class", "dijit/layout/ContentPane", "dojo/dom-construct",
	"../formatter", "../TabContainer", "../GenomeOverview",
	"dojo/request", "dojo/_base/lang", "../FeatureGridContainer", "../SpecialtyGeneGridContainer",
	"../ActionBar", "../ContainerActionBar", "../PathwaysContainer", "../ProteinFamiliesContainer",
	"../DiseaseContainer", "../PublicationGridContainer", "../CircularViewerContainer",
	"../TranscriptomicsContainer"/*,"JBrowse/Browser"*/, "../InteractionsContainer","../Phylogeny"
], function(declare, TabViewerBase, on, Topic,
			domClass, ContentPane, domConstruct,
			formatter, TabContainer, GenomeOverview,
			xhr, lang, FeatureGridContainer, SpecialtyGeneGridContainer,
			ActionBar, ContainerActionBar, PathwaysContainer, ProteinFamiliesContainer,
			DiseaseContainer, PublicationGridContainer, CircularViewerContainer,
			TranscriptomicsContainer/*, JBrowser*/, InteractionsContainer, Phylogeny){
	return declare([TabViewerBase], {
		"baseClass": "GenomeGroup",
		"disabled": false,
		"query": null,
		containerType: "genome_group",
		genome_id: "",
		apiServiceUrl: window.App.dataAPI,
		createOverviewPanel: function(state){
			return new ContentPane({content: "Overview", title: "Overview",id: this.viewer.id + "_" + "overview", state: this.state});
		},
		postCreate: function(){
			if(!this.state){
				this.state = {};
			}

			this.inherited(arguments);
			this.overview = this.createOverviewPanel();
			this.genomeBrowser=new ContentPane({title: "Genome Browser", id: this.viewer.id + "_genomeBrowser", content: "Genome Browser"})
			this.compareRegionViewer=new ContentPane({title: "Compare Region Viewer", id: this.viewer.id + "_compareRegionViewer", content: "CompareRegionViewer"})
			this.pathways=new ContentPane({title: "Pathways", id: this.viewer.id + "_pathways", content: "Pathways"})
			this.transcriptomics=new ContentPane({title: "Transcriptomics", id: this.viewer.id + "_transcriptomics", content: "Transcriptomics"})
			this.correlatedGenes=new ContentPane({title: "Correlated Genes", id: this.viewer.id + "_correlatedGenes", content: "Correlated Genes"})
			
			this.viewer.addChild(this.overview)
			this.viewer.addChild(this.genomeBrowser);
			this.viewer.addChild(this.compareRegionViewer);
			this.viewer.addChild(this.transcriptomics);
			this.viewer.addChild(this.correlatedGenes);
		}
	});
});