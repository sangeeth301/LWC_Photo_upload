// newMaintenance.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import linkFilesToRecord from '@salesforce/apex/NewMaintenance.linkFilesToRecord';

export default class NewMaintenance extends NavigationMixin(LightningElement) {

    @track recordId;
    uploadedFileIds = [];  // Store uploaded file IDs

    // Handle record creation success
    handleSuccess(event) {
        this.recordId = event.detail.id;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Maintenance record created successfully. Linking uploaded files...',
                variant: 'success'
            })
        );

        // Link uploaded files to the new record
        if (this.uploadedFileIds.length > 0) {
            linkFilesToRecord({ 
                recordId: this.recordId, 
                fileIds: this.uploadedFileIds 
            })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Uploaded files have been linked to the record.',
                        variant: 'success'
                    })
                );

                // Navigate to the record
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        objectApiName: 'Maintenance__c',
                        actionName: 'view'
                    }
                });
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Linking Files',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        }
    }

    // Handle record creation error
    handleError(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: event.detail.message,
                variant: 'error'
            })
        );
    }

    // Handle file uploads and store file IDs
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;

        uploadedFiles.forEach(file => {
            this.uploadedFileIds.push(file.documentId);  // Store file IDs
        });

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: `${uploadedFiles.length} file(s) uploaded.`,
                variant: 'success'
            })
        );
    }
}