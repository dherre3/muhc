var myApp=angular.module('MUHCApp');
myApp.service('Documents',['UserPreferences', '$cordovaDevice','$cordovaNetwork', 'UserAuthorizationInfo','$q','$rootScope', '$filter','FileManagerService',function(UserPreferences,$cordovaDevice,$cordovaNetwork,UserAuthorizationInfo,$q,$rootScope,$filter,FileManagerService){
	var photos=[];
	function isDocumentStored(serNum){
		var user=UserAuthorizationInfo.getUserName();
		var key=user+Documents;

	}
	return{
		setDocumentsOnline:function(documents, mode){
			var r=$q.defer();
			photos=[];
			console.log(documents);
			this.Photos=[];
			if(!documents) return;
				var keysDocuments=Object.keys(documents);
				for (var i = 0; i < keysDocuments.length; i++) {
					var n =documents[keysDocuments[i]].FinalFileName.lastIndexOf('.');
					documents[keysDocuments[i]].DocumentType=documents[keysDocuments[i]].FinalFileName.substring(n+1,documents[keysDocuments[i]].FinalFileName.length);
					documents[keysDocuments[i]].Content="../listener/Documents/"+documents[keysDocuments[i]].FinalFileName;
					var imageToPhotoObject={};
					imageToPhotoObject.AliasName_EN=documents[keysDocuments[i]].AliasName_EN;
					imageToPhotoObject.AliasName_FR=documents[keysDocuments[i]].AliasName_FR;
					imageToPhotoObject.DateAdded=$filter('formatDate')(documents[keysDocuments[i]].DateAdded);
					imageToPhotoObject.AliasDescription_EN=documents[keysDocuments[i]].AliasDescription_EN;
					imageToPhotoObject.AliasDescription_FR=documents[keysDocuments[i]].AliasDescription_FR;
					imageToPhotoObject.DocumentSerNum=documents[keysDocuments[i]].DocumentSerNum;
					imageToPhotoObject.PathFileSystem=documents[keysDocuments[i]].PathFileSystem;
					imageToPhotoObject.NameFileSystem=documents[keysDocuments[i]].NameFileSystem;
					imageToPhotoObject.DocumentType=documents[keysDocuments[i]].DocumentType;
					imageToPhotoObject.Content=documents[keysDocuments[i]].Content;
					delete documents[keysDocuments[i]].Content;
          			delete documents[keysDocuments[i]].PathLocation;
					photos.push(imageToPhotoObject);
					this.Photos.push(imageToPhotoObject);
				};
				r.resolve(documents);
				return r.promise;
		},
		setDocumentsOffline:function(documents)
		{
			var r=$q.defer();
			this.Photos=[];
			photos=[];
			if(!documents) return;
			var keysDocuments=Object.keys(documents);
			var promises=[];
			for (var i = 0; i < keysDocuments.length; i++) {
				var imageToPhotoObject={};
				documents[keysDocuments[i]].DateAdded=$filter('formatDate')(documents[keysDocuments[i]].DateAdded);
				promises.push(FileManagerService.getFileUrl(documents[keysDocuments[i]].PathFileSystem));
				photos.push(documents[keysDocuments[i]]);
				this.Photos.push(imageToPhotoObject);
			}
			console.log(documents);
			$q.all(promises).then(function(results){
				console.log(results);
				for (var i = 0; i < results.length; i++) {
					documents[i].Content=results[i];
				}
				r.resolve(documents);
			},function(error){
				console.log(error);
				r.resolve(documents);
			});
			this.Photos=photos;
			 return r.promise;
		},
		getDocuments:function(){
			return photos;
		},
		getDocumentBySerNum:function(serNum)
		{
			for (var i = 0; i < this.Photos.length; i++) {
				if(this.Photos[i].DocumentSerNum==serNum){
					return this.Photos[i];
				}
			};
		}

	};


}]);
