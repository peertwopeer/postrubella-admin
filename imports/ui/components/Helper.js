import swal from 'sweetalert';
/*
 Helper component for client-side
*/
const Helper = {

    // alert message if dropdown is empty
    emptyDropDownAlert : function (itemsCount = 0, message = "No items found" ){
        if(itemsCount == 0){
          swal (message,'','error');
        }
    }

}

export default Helper;