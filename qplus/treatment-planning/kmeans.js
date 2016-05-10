var kMeans = require('kmeans-js');
var sqlInterface = require('./sqlInterface.js');
var utilities = require('./utilities.js');
var Q = require('q');
var exports = module.exports = {};
/*
* Sequence Analysis Grouping by swapping pairs.
*/

exports.kmeansAlgorithm = function(argument)
{
  /**
   * First step, create copy of input
   */
  var r= Q.defer();
  sqlInterface.runSqlQuery(argument.CancerType, []).then(
   function(rows)
    {
      rows = utilities.eliminateCRRAppointments(rows);
      rows = utilities.clearDupSequencialAliases(rows);
      var sequencePerPatient = utilities.getSequencePerPatient(rows, 'AliasSerNum');
      var arrayOfDistinctSequences = utilities.getArrayOfDistinctSequences(sequencePerPatient);
      arrayOfDistinctSequences = fillZeros(arrayOfDistinctSequences, maxLength(arrayOfDistinctSequences));
      //var groups = kmeans(arrayOfDistinctSequences, 20);
    var km = new kMeans({
        K: 2
    });

    km.cluster(arrayOfDistinctSequences);
    while (km.step()) {
        km.findClosestCentroids();
        km.moveCentroids();
        if(km.hasConverged()) break;
    }

    console.log('Finished in:', km.currentIteration, ' iterations');
    console.log(km.centroids, km.clusters);
    });
  
};
exports.kmeansAlgorithm({CancerType:'Breast'});

function maxLength(arrayOfDistinctSequences)
{
    var max = 0;
    for (var i = 0; i < arrayOfDistinctSequences.length; i++) {
        if(arrayOfDistinctSequences[i].length>max)
        {
            max = arrayOfDistinctSequences[i].length;
        }
    }
    return max;
}
function fillZeros(arrayOfDistinctSequences, length)
{
    for (var i = 0; i < arrayOfDistinctSequences.length; i++) {
        for (var j = arrayOfDistinctSequences[i].length; j < length; j++) {
            arrayOfDistinctSequences[i].push(0);
        }        
    }
    return arrayOfDistinctSequences;
}
function kmeans( arrayToProcess, Clusters )
{

  var Groups = [];
  var Centroids = [];
  var oldCentroids = [];
  var changed = false;

  // order the input array
  arrayToProcess.sort(function(a,b){return a - b})  
  
  // initialise group arrays
  for( initGroups=0; initGroups < Clusters; initGroups++ )
  {
  
    Groups[initGroups] = [];

  }  
  
  // pick initial centroids
  
  initialCentroids=Math.round( arrayToProcess.length/(Clusters+1) );  
  
  for( i=0; i<Clusters; i++ )
  {
  
    Centroids[i]=arrayToProcess[ (initialCentroids*(i+1)) ];
  
  }
  
  do
  {
  
    for( j=0; j<Clusters; j++ )
	{
	
	  Groups[j] = [];
	
	}
  
    changed=false;
	
	for( i=0; i<arrayToProcess.length; i++ )
	{

	  Distance=-1;
	  oldDistance=-1
	
 	  for( j=0; j<Clusters; j++ )
	  {
	  
        distance = Math.abs( Centroids[j]-arrayToProcess[i] );	
		
		if ( oldDistance==-1 )
		{
		
		   oldDistance = distance;
		   newGroup = j;
		
		}
		else if ( distance <= oldDistance )
		{
		  
		    newGroup=j;
			oldDistance = distance;
		  
		}
	  
	  }	
	  
	  Groups[newGroup].push( arrayToProcess[i] );	  
	
	}
  
    oldCentroids=Centroids;
  
    for ( j=0; j<Clusters; j++ )
	{
  
      total=0;
	  newCentroid=0;
	  
	  for( i=0; i<Groups[j].length; i++ )
	  {
	  
	    total+=Groups[j][i];
	  
	  } 
	
	  newCentroid=total/Groups[newGroup].length;  
	  
	  Centroids[j]=newCentroid;
	  
	}
  
    for( j=0; j<Clusters; j++ )
	{
	
	  if ( Centroids[j]!=oldCentroids[j] )
	  {
	  
	    changed=true;
	  
	  }
	
	}
  
  }
  while( changed==true );
  
  return Groups;
  
}